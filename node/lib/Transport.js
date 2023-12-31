"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTransportTraceEventData = exports.parseBaseTransportStats = exports.parseBaseTransportDump = exports.parseTuple = exports.serializeProtocol = exports.parseProtocol = exports.parseSctpState = exports.Transport = void 0;
const Logger_1 = require("./Logger");
const EnhancedEventEmitter_1 = require("./EnhancedEventEmitter");
const ortc = require("./ortc");
const Producer_1 = require("./Producer");
const Consumer_1 = require("./Consumer");
const DataProducer_1 = require("./DataProducer");
const DataConsumer_1 = require("./DataConsumer");
const RtpParameters_1 = require("./RtpParameters");
const SctpParameters_1 = require("./SctpParameters");
const utils = require("./utils");
const common_1 = require("./fbs/common");
const FbsRequest = require("./fbs/request");
const media_kind_1 = require("./fbs/rtp-parameters/media-kind");
const FbsConsumer = require("./fbs/consumer");
const FbsDataConsumer = require("./fbs/data-consumer");
const FbsDataProducer = require("./fbs/data-producer");
const FbsTransport = require("./fbs/transport");
const FbsRouter = require("./fbs/router");
const FbsRtpParameters = require("./fbs/rtp-parameters");
const sctp_state_1 = require("./fbs/sctp-association/sctp-state");
const logger = new Logger_1.Logger('Transport');
class Transport extends EnhancedEventEmitter_1.EnhancedEventEmitter {
    // Internal data.
    internal;
    // Transport data. This is set by the subclass.
    #data;
    // Channel instance.
    channel;
    // Close flag.
    #closed = false;
    // Custom app data.
    #appData;
    // Method to retrieve Router RTP capabilities.
    #getRouterRtpCapabilities;
    // Method to retrieve a Producer.
    getProducerById;
    // Method to retrieve a DataProducer.
    getDataProducerById;
    // Producers map.
    #producers = new Map();
    // Consumers map.
    consumers = new Map();
    // DataProducers map.
    dataProducers = new Map();
    // DataConsumers map.
    dataConsumers = new Map();
    // RTCP CNAME for Producers.
    #cnameForProducers;
    // Next MID for Consumers. It's converted into string when used.
    #nextMidForConsumers = 0;
    // Buffer with available SCTP stream ids.
    #sctpStreamIds;
    // Next SCTP stream id.
    #nextSctpStreamId = 0;
    // Observer instance.
    #observer = new EnhancedEventEmitter_1.EnhancedEventEmitter();
    /**
     * @private
     * @interface
     */
    constructor({ internal, data, channel, appData, getRouterRtpCapabilities, getProducerById, getDataProducerById }) {
        super();
        logger.debug('constructor()');
        this.internal = internal;
        this.#data = data;
        this.channel = channel;
        this.#appData = appData || {};
        this.#getRouterRtpCapabilities = getRouterRtpCapabilities;
        this.getProducerById = getProducerById;
        this.getDataProducerById = getDataProducerById;
    }
    /**
     * Transport id.
     */
    get id() {
        return this.internal.transportId;
    }
    /**
     * Whether the Transport is closed.
     */
    get closed() {
        return this.#closed;
    }
    /**
     * App custom data.
     */
    get appData() {
        return this.#appData;
    }
    /**
     * App custom data setter.
     */
    set appData(appData) {
        this.#appData = appData;
    }
    /**
     * Observer.
     */
    get observer() {
        return this.#observer;
    }
    /**
     * @private
     * Just for testing purposes.
     */
    get channelForTesting() {
        return this.channel;
    }
    /**
     * Close the Transport.
     */
    close() {
        if (this.#closed) {
            return;
        }
        logger.debug('close()');
        this.#closed = true;
        // Remove notification subscriptions.
        this.channel.removeAllListeners(this.internal.transportId);
        /* Build Request. */
        const requestOffset = new FbsRouter.CloseTransportRequestT(this.internal.transportId).pack(this.channel.bufferBuilder);
        this.channel.request(FbsRequest.Method.ROUTER_CLOSE_TRANSPORT, FbsRequest.Body.Router_CloseTransportRequest, requestOffset, this.internal.routerId).catch(() => { });
        // Close every Producer.
        for (const producer of this.#producers.values()) {
            producer.transportClosed();
            // Must tell the Router.
            this.emit('@producerclose', producer);
        }
        this.#producers.clear();
        // Close every Consumer.
        for (const consumer of this.consumers.values()) {
            consumer.transportClosed();
        }
        this.consumers.clear();
        // Close every DataProducer.
        for (const dataProducer of this.dataProducers.values()) {
            dataProducer.transportClosed();
            // Must tell the Router.
            this.emit('@dataproducerclose', dataProducer);
        }
        this.dataProducers.clear();
        // Close every DataConsumer.
        for (const dataConsumer of this.dataConsumers.values()) {
            dataConsumer.transportClosed();
        }
        this.dataConsumers.clear();
        this.emit('@close');
        // Emit observer event.
        this.#observer.safeEmit('close');
    }
    /**
     * Router was closed.
     *
     * @private
     * @virtual
     */
    routerClosed() {
        if (this.#closed) {
            return;
        }
        logger.debug('routerClosed()');
        this.#closed = true;
        // Remove notification subscriptions.
        this.channel.removeAllListeners(this.internal.transportId);
        // Close every Producer.
        for (const producer of this.#producers.values()) {
            producer.transportClosed();
            // NOTE: No need to tell the Router since it already knows (it has
            // been closed in fact).
        }
        this.#producers.clear();
        // Close every Consumer.
        for (const consumer of this.consumers.values()) {
            consumer.transportClosed();
        }
        this.consumers.clear();
        // Close every DataProducer.
        for (const dataProducer of this.dataProducers.values()) {
            dataProducer.transportClosed();
            // NOTE: No need to tell the Router since it already knows (it has
            // been closed in fact).
        }
        this.dataProducers.clear();
        // Close every DataConsumer.
        for (const dataConsumer of this.dataConsumers.values()) {
            dataConsumer.transportClosed();
        }
        this.dataConsumers.clear();
        this.safeEmit('routerclose');
        // Emit observer event.
        this.#observer.safeEmit('close');
    }
    /**
     * Listen server was closed (this just happens in WebRtcTransports when their
     * associated WebRtcServer is closed).
     *
     * @private
     */
    listenServerClosed() {
        if (this.#closed) {
            return;
        }
        logger.debug('listenServerClosed()');
        this.#closed = true;
        // Remove notification subscriptions.
        this.channel.removeAllListeners(this.internal.transportId);
        // Close every Producer.
        for (const producer of this.#producers.values()) {
            producer.transportClosed();
            // NOTE: No need to tell the Router since it already knows (it has
            // been closed in fact).
        }
        this.#producers.clear();
        // Close every Consumer.
        for (const consumer of this.consumers.values()) {
            consumer.transportClosed();
        }
        this.consumers.clear();
        // Close every DataProducer.
        for (const dataProducer of this.dataProducers.values()) {
            dataProducer.transportClosed();
            // NOTE: No need to tell the Router since it already knows (it has
            // been closed in fact).
        }
        this.dataProducers.clear();
        // Close every DataConsumer.
        for (const dataConsumer of this.dataConsumers.values()) {
            dataConsumer.transportClosed();
        }
        this.dataConsumers.clear();
        // Need to emit this event to let the parent Router know since
        // transport.listenServerClosed() is called by the listen server.
        // NOTE: Currently there is just WebRtcServer for WebRtcTransports.
        this.emit('@listenserverclose');
        this.safeEmit('listenserverclose');
        // Emit observer event.
        this.#observer.safeEmit('close');
    }
    /**
     * Dump Transport.
     *
     * @abstract
     */
    async dump() {
        // Should not happen.
        throw new Error('method implemented in the subclass');
    }
    /**
     * Get Transport stats.
     *
     * @abstract
     */
    async getStats() {
        // Should not happen.
        throw new Error('method implemented in the subclass');
    }
    /**
     * Provide the Transport remote parameters.
     *
     * @abstract
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async connect(params) {
        // Should not happen.
        throw new Error('method implemented in the subclass');
    }
    /**
     * Set maximum incoming bitrate for receiving media.
     */
    async setMaxIncomingBitrate(bitrate) {
        logger.debug('setMaxIncomingBitrate() [bitrate:%s]', bitrate);
        /* Build Request. */
        const requestOffset = FbsTransport.SetMaxIncomingBitrateRequest
            .createSetMaxIncomingBitrateRequest(this.channel.bufferBuilder, bitrate);
        await this.channel.request(FbsRequest.Method.TRANSPORT_SET_MAX_INCOMING_BITRATE, FbsRequest.Body.Transport_SetMaxIncomingBitrateRequest, requestOffset, this.internal.transportId);
    }
    /**
     * Set maximum outgoing bitrate for sending media.
     */
    async setMaxOutgoingBitrate(bitrate) {
        logger.debug('setMaxOutgoingBitrate() [bitrate:%s]', bitrate);
        /* Build Request. */
        const requestOffset = new FbsTransport.SetMaxOutgoingBitrateRequestT(bitrate).pack(this.channel.bufferBuilder);
        await this.channel.request(FbsRequest.Method.TRANSPORT_SET_MAX_OUTGOING_BITRATE, FbsRequest.Body.Transport_SetMaxOutgoingBitrateRequest, requestOffset, this.internal.transportId);
    }
    /**
     * Set minimum outgoing bitrate for sending media.
     */
    async setMinOutgoingBitrate(bitrate) {
        logger.debug('setMinOutgoingBitrate() [bitrate:%s]', bitrate);
        /* Build Request. */
        const requestOffset = new FbsTransport.SetMinOutgoingBitrateRequestT(bitrate).pack(this.channel.bufferBuilder);
        await this.channel.request(FbsRequest.Method.TRANSPORT_SET_MIN_OUTGOING_BITRATE, FbsRequest.Body.Transport_SetMinOutgoingBitrateRequest, requestOffset, this.internal.transportId);
    }
    /**
     * Create a Producer.
     */
    async produce({ id = undefined, kind, rtpParameters, paused = false, keyFrameRequestDelay, appData }) {
        logger.debug('produce()');
        if (id && this.#producers.has(id)) {
            throw new TypeError(`a Producer with same id "${id}" already exists`);
        }
        else if (!['audio', 'video'].includes(kind)) {
            throw new TypeError(`invalid kind "${kind}"`);
        }
        else if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        // This may throw.
        ortc.validateRtpParameters(rtpParameters);
        // If missing or empty encodings, add one.
        if (!rtpParameters.encodings ||
            !Array.isArray(rtpParameters.encodings) ||
            rtpParameters.encodings.length === 0) {
            rtpParameters.encodings = [{}];
        }
        // Don't do this in PipeTransports since there we must keep CNAME value in
        // each Producer.
        if (this.constructor.name !== 'PipeTransport') {
            // If CNAME is given and we don't have yet a CNAME for Producers in this
            // Transport, take it.
            if (!this.#cnameForProducers && rtpParameters.rtcp && rtpParameters.rtcp.cname) {
                this.#cnameForProducers = rtpParameters.rtcp.cname;
            }
            // Otherwise if we don't have yet a CNAME for Producers and the RTP
            // parameters do not include CNAME, create a random one.
            else if (!this.#cnameForProducers) {
                this.#cnameForProducers = utils.generateUUIDv4().substr(0, 8);
            }
            // Override Producer's CNAME.
            rtpParameters.rtcp = rtpParameters.rtcp || {};
            rtpParameters.rtcp.cname = this.#cnameForProducers;
        }
        const routerRtpCapabilities = this.#getRouterRtpCapabilities();
        // This may throw.
        const rtpMapping = ortc.getProducerRtpParametersMapping(rtpParameters, routerRtpCapabilities);
        // This may throw.
        const consumableRtpParameters = ortc.getConsumableRtpParameters(kind, rtpParameters, routerRtpCapabilities, rtpMapping);
        const producerId = id || utils.generateUUIDv4();
        const requestOffset = createProduceRequest({
            builder: this.channel.bufferBuilder,
            producerId,
            kind,
            rtpParameters,
            rtpMapping,
            keyFrameRequestDelay,
            paused
        });
        const response = await this.channel.request(FbsRequest.Method.TRANSPORT_PRODUCE, FbsRequest.Body.Transport_ProduceRequest, requestOffset, this.internal.transportId);
        /* Decode Response. */
        const produceResponse = new FbsTransport.ProduceResponse();
        response.body(produceResponse);
        const status = produceResponse.unpack();
        const data = {
            kind,
            rtpParameters,
            type: (0, Producer_1.producerTypeFromFbs)(status.type),
            consumableRtpParameters
        };
        const producer = new Producer_1.Producer({
            internal: {
                ...this.internal,
                producerId
            },
            data,
            channel: this.channel,
            appData,
            paused
        });
        this.#producers.set(producer.id, producer);
        producer.on('@close', () => {
            this.#producers.delete(producer.id);
            this.emit('@producerclose', producer);
        });
        this.emit('@newproducer', producer);
        // Emit observer event.
        this.#observer.safeEmit('newproducer', producer);
        return producer;
    }
    /**
     * Create a Consumer.
     *
     * @virtual
     */
    async consume({ producerId, rtpCapabilities, paused = false, mid, preferredLayers, ignoreDtx = false, enableRtx, pipe = false, appData }) {
        logger.debug('consume()');
        if (!producerId || typeof producerId !== 'string') {
            throw new TypeError('missing producerId');
        }
        else if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        else if (mid && (typeof mid !== 'string' || mid.length === 0)) {
            throw new TypeError('if given, mid must be non empty string');
        }
        // This may throw.
        ortc.validateRtpCapabilities(rtpCapabilities);
        const producer = this.getProducerById(producerId);
        if (!producer) {
            throw Error(`Producer with id "${producerId}" not found`);
        }
        // If enableRtx is not given, set it to true if video and false if audio.
        if (enableRtx === undefined) {
            enableRtx = producer.kind === 'video';
        }
        // This may throw.
        const rtpParameters = ortc.getConsumerRtpParameters({
            consumableRtpParameters: producer.consumableRtpParameters,
            remoteRtpCapabilities: rtpCapabilities,
            pipe,
            enableRtx
        });
        // Set MID.
        if (!pipe) {
            if (mid) {
                rtpParameters.mid = mid;
            }
            else {
                rtpParameters.mid = `${this.#nextMidForConsumers++}`;
                // We use up to 8 bytes for MID (string).
                if (this.#nextMidForConsumers === 100000000) {
                    logger.error(`consume() | reaching max MID value "${this.#nextMidForConsumers}"`);
                    this.#nextMidForConsumers = 0;
                }
            }
        }
        const consumerId = utils.generateUUIDv4();
        const requestOffset = createConsumeRequest({
            builder: this.channel.bufferBuilder,
            producer,
            consumerId,
            rtpParameters,
            paused,
            preferredLayers,
            ignoreDtx,
            pipe
        });
        const response = await this.channel.request(FbsRequest.Method.TRANSPORT_CONSUME, FbsRequest.Body.Transport_ConsumeRequest, requestOffset, this.internal.transportId);
        /* Decode Response. */
        const consumeResponse = new FbsTransport.ConsumeResponse();
        response.body(consumeResponse);
        const status = consumeResponse.unpack();
        const data = {
            producerId,
            kind: producer.kind,
            rtpParameters,
            type: pipe ? 'pipe' : producer.type
        };
        const consumer = new Consumer_1.Consumer({
            internal: {
                ...this.internal,
                consumerId
            },
            data,
            channel: this.channel,
            appData,
            paused: status.paused,
            producerPaused: status.producerPaused,
            score: status.score ?? undefined,
            preferredLayers: status.preferredLayers ?
                {
                    spatialLayer: status.preferredLayers.spatialLayer,
                    temporalLayer: status.preferredLayers.temporalLayer !== null ?
                        status.preferredLayers.temporalLayer :
                        undefined
                } :
                undefined
        });
        this.consumers.set(consumer.id, consumer);
        consumer.on('@close', () => this.consumers.delete(consumer.id));
        consumer.on('@producerclose', () => this.consumers.delete(consumer.id));
        // Emit observer event.
        this.#observer.safeEmit('newconsumer', consumer);
        return consumer;
    }
    /**
     * Create a DataProducer.
     */
    async produceData({ id = undefined, sctpStreamParameters, label = '', protocol = '', paused = false, appData } = {}) {
        logger.debug('produceData()');
        if (id && this.dataProducers.has(id)) {
            throw new TypeError(`a DataProducer with same id "${id}" already exists`);
        }
        else if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        let type;
        // If this is not a DirectTransport, sctpStreamParameters are required.
        if (this.constructor.name !== 'DirectTransport') {
            type = 'sctp';
            // This may throw.
            ortc.validateSctpStreamParameters(sctpStreamParameters);
        }
        // If this is a DirectTransport, sctpStreamParameters must not be given.
        else {
            type = 'direct';
            if (sctpStreamParameters) {
                logger.warn('produceData() | sctpStreamParameters are ignored when producing data on a DirectTransport');
            }
        }
        const dataProducerId = id || utils.generateUUIDv4();
        const requestOffset = createProduceDataRequest({
            builder: this.channel.bufferBuilder,
            dataProducerId,
            type,
            sctpStreamParameters,
            label,
            protocol,
            paused
        });
        const response = await this.channel.request(FbsRequest.Method.TRANSPORT_PRODUCE_DATA, FbsRequest.Body.Transport_ProduceDataRequest, requestOffset, this.internal.transportId);
        /* Decode Response. */
        const produceDataResponse = new FbsDataProducer.DumpResponse();
        response.body(produceDataResponse);
        const dump = (0, DataProducer_1.parseDataProducerDumpResponse)(produceDataResponse);
        const dataProducer = new DataProducer_1.DataProducer({
            internal: {
                ...this.internal,
                dataProducerId
            },
            data: {
                type: dump.type,
                sctpStreamParameters: dump.sctpStreamParameters,
                label: dump.label,
                protocol: dump.protocol
            },
            channel: this.channel,
            paused,
            appData
        });
        this.dataProducers.set(dataProducer.id, dataProducer);
        dataProducer.on('@close', () => {
            this.dataProducers.delete(dataProducer.id);
            this.emit('@dataproducerclose', dataProducer);
        });
        this.emit('@newdataproducer', dataProducer);
        // Emit observer event.
        this.#observer.safeEmit('newdataproducer', dataProducer);
        return dataProducer;
    }
    /**
     * Create a DataConsumer.
     */
    async consumeData({ dataProducerId, ordered, maxPacketLifeTime, maxRetransmits, paused = false, subchannels, appData }) {
        logger.debug('consumeData()');
        if (!dataProducerId || typeof dataProducerId !== 'string') {
            throw new TypeError('missing dataProducerId');
        }
        else if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        const dataProducer = this.getDataProducerById(dataProducerId);
        if (!dataProducer) {
            throw Error(`DataProducer with id "${dataProducerId}" not found`);
        }
        let type;
        let sctpStreamParameters;
        let sctpStreamId;
        // If this is not a DirectTransport, use sctpStreamParameters from the
        // DataProducer (if type 'sctp') unless they are given in method parameters.
        if (this.constructor.name !== 'DirectTransport') {
            type = 'sctp';
            sctpStreamParameters =
                (utils.clone(dataProducer.sctpStreamParameters) ?? {});
            // Override if given.
            if (ordered !== undefined) {
                sctpStreamParameters.ordered = ordered;
            }
            if (maxPacketLifeTime !== undefined) {
                sctpStreamParameters.maxPacketLifeTime = maxPacketLifeTime;
            }
            if (maxRetransmits !== undefined) {
                sctpStreamParameters.maxRetransmits = maxRetransmits;
            }
            // This may throw.
            sctpStreamId = this.getNextSctpStreamId();
            this.#sctpStreamIds[sctpStreamId] = 1;
            sctpStreamParameters.streamId = sctpStreamId;
        }
        // If this is a DirectTransport, sctpStreamParameters must not be used.
        else {
            type = 'direct';
            if (ordered !== undefined ||
                maxPacketLifeTime !== undefined ||
                maxRetransmits !== undefined) {
                logger.warn('consumeData() | ordered, maxPacketLifeTime and maxRetransmits are ignored when consuming data on a DirectTransport');
            }
        }
        const { label, protocol } = dataProducer;
        const dataConsumerId = utils.generateUUIDv4();
        const requestOffset = createConsumeDataRequest({
            builder: this.channel.bufferBuilder,
            dataConsumerId,
            dataProducerId,
            type,
            sctpStreamParameters,
            label,
            protocol,
            paused,
            subchannels
        });
        const response = await this.channel.request(FbsRequest.Method.TRANSPORT_CONSUME_DATA, FbsRequest.Body.Transport_ConsumeDataRequest, requestOffset, this.internal.transportId);
        /* Decode Response. */
        const consumeDataResponse = new FbsDataConsumer.DumpResponse();
        response.body(consumeDataResponse);
        const dump = (0, DataConsumer_1.parseDataConsumerDumpResponse)(consumeDataResponse);
        const dataConsumer = new DataConsumer_1.DataConsumer({
            internal: {
                ...this.internal,
                dataConsumerId
            },
            data: {
                dataProducerId: dump.dataProducerId,
                type: dump.type,
                sctpStreamParameters: dump.sctpStreamParameters,
                label: dump.label,
                protocol: dump.protocol,
                bufferedAmountLowThreshold: dump.bufferedAmountLowThreshold
            },
            channel: this.channel,
            paused: dump.paused,
            subchannels: dump.subchannels,
            dataProducerPaused: dump.dataProducerPaused,
            appData
        });
        this.dataConsumers.set(dataConsumer.id, dataConsumer);
        dataConsumer.on('@close', () => {
            this.dataConsumers.delete(dataConsumer.id);
            if (this.#sctpStreamIds) {
                this.#sctpStreamIds[sctpStreamId] = 0;
            }
        });
        dataConsumer.on('@dataproducerclose', () => {
            this.dataConsumers.delete(dataConsumer.id);
            if (this.#sctpStreamIds) {
                this.#sctpStreamIds[sctpStreamId] = 0;
            }
        });
        // Emit observer event.
        this.#observer.safeEmit('newdataconsumer', dataConsumer);
        return dataConsumer;
    }
    /**
     * Enable 'trace' event.
     */
    async enableTraceEvent(types = []) {
        logger.debug('enableTraceEvent()');
        if (!Array.isArray(types)) {
            throw new TypeError('types must be an array');
        }
        if (types.find((type) => typeof type !== 'string')) {
            throw new TypeError('every type must be a string');
        }
        // Convert event types.
        const fbsEventTypes = [];
        for (const eventType of types) {
            try {
                fbsEventTypes.push(transportTraceEventTypeToFbs(eventType));
            }
            catch (error) {
                // Ignore invalid event types.
            }
        }
        /* Build Request. */
        const requestOffset = new FbsTransport.EnableTraceEventRequestT(fbsEventTypes).pack(this.channel.bufferBuilder);
        await this.channel.request(FbsRequest.Method.TRANSPORT_ENABLE_TRACE_EVENT, FbsRequest.Body.Transport_EnableTraceEventRequest, requestOffset, this.internal.transportId);
    }
    getNextSctpStreamId() {
        if (!this.#data.sctpParameters ||
            typeof this.#data.sctpParameters.MIS !== 'number') {
            throw new TypeError('missing sctpParameters.MIS');
        }
        const numStreams = this.#data.sctpParameters.MIS;
        if (!this.#sctpStreamIds) {
            this.#sctpStreamIds = Buffer.alloc(numStreams, 0);
        }
        let sctpStreamId;
        for (let idx = 0; idx < this.#sctpStreamIds.length; ++idx) {
            sctpStreamId = (this.#nextSctpStreamId + idx) % this.#sctpStreamIds.length;
            if (!this.#sctpStreamIds[sctpStreamId]) {
                this.#nextSctpStreamId = sctpStreamId + 1;
                return sctpStreamId;
            }
        }
        throw new Error('no sctpStreamId available');
    }
}
exports.Transport = Transport;
function transportTraceEventTypeToFbs(eventType) {
    switch (eventType) {
        case 'probation':
            return FbsTransport.TraceEventType.PROBATION;
        case 'bwe':
            return FbsTransport.TraceEventType.BWE;
        default:
            throw new TypeError(`invalid TransportTraceEventType: ${eventType}`);
    }
}
function transportTraceEventTypeFromFbs(eventType) {
    switch (eventType) {
        case FbsTransport.TraceEventType.PROBATION:
            return 'probation';
        case FbsTransport.TraceEventType.BWE:
            return 'bwe';
    }
}
function parseSctpState(fbsSctpState) {
    switch (fbsSctpState) {
        case sctp_state_1.SctpState.NEW:
            return 'new';
        case sctp_state_1.SctpState.CONNECTING:
            return 'connecting';
        case sctp_state_1.SctpState.CONNECTED:
            return 'connected';
        case sctp_state_1.SctpState.FAILED:
            return 'failed';
        case sctp_state_1.SctpState.CLOSED:
            return 'closed';
        default:
            throw new TypeError(`invalid SctpState: ${fbsSctpState}`);
    }
}
exports.parseSctpState = parseSctpState;
function parseProtocol(protocol) {
    switch (protocol) {
        case FbsTransport.Protocol.UDP:
            return 'udp';
        case FbsTransport.Protocol.TCP:
            return 'tcp';
    }
}
exports.parseProtocol = parseProtocol;
function serializeProtocol(protocol) {
    switch (protocol) {
        case 'udp':
            return FbsTransport.Protocol.UDP;
        case 'tcp':
            return FbsTransport.Protocol.TCP;
    }
}
exports.serializeProtocol = serializeProtocol;
function parseTuple(binary) {
    return {
        localIp: binary.localIp(),
        localPort: binary.localPort(),
        remoteIp: binary.remoteIp() ?? undefined,
        remotePort: binary.remotePort(),
        protocol: parseProtocol(binary.protocol())
    };
}
exports.parseTuple = parseTuple;
function parseBaseTransportDump(binary) {
    // Retrieve producerIds.
    const producerIds = utils.parseVector(binary, 'producerIds');
    // Retrieve consumerIds.
    const consumerIds = utils.parseVector(binary, 'consumerIds');
    // Retrieve map SSRC consumerId.
    const mapSsrcConsumerId = utils.parseUint32StringVector(binary, 'mapSsrcConsumerId');
    // Retrieve map RTX SSRC consumerId.
    const mapRtxSsrcConsumerId = utils.parseUint32StringVector(binary, 'mapRtxSsrcConsumerId');
    // Retrieve dataProducerIds.
    const dataProducerIds = utils.parseVector(binary, 'dataProducerIds');
    // Retrieve dataConsumerIds.
    const dataConsumerIds = utils.parseVector(binary, 'dataConsumerIds');
    // Retrieve recvRtpHeaderExtesions.
    const recvRtpHeaderExtensions = parseRecvRtpHeaderExtensions(binary.recvRtpHeaderExtensions());
    // Retrieve RtpListener.
    const rtpListener = parseRtpListenerDump(binary.rtpListener());
    // Retrieve SctpParameters.
    const fbsSctpParameters = binary.sctpParameters();
    let sctpParameters;
    if (fbsSctpParameters) {
        sctpParameters = (0, SctpParameters_1.parseSctpParametersDump)(fbsSctpParameters);
    }
    // Retrieve sctpState.
    const sctpState = binary.sctpState() === null ? undefined : parseSctpState(binary.sctpState());
    // Retrive sctpListener.
    const sctpListener = binary.sctpListener() ?
        parseSctpListenerDump(binary.sctpListener()) :
        undefined;
    // Retrieve traceEventTypes.
    const traceEventTypes = utils.parseVector(binary, 'traceEventTypes', transportTraceEventTypeFromFbs);
    return {
        id: binary.id(),
        direct: binary.direct(),
        producerIds: producerIds,
        consumerIds: consumerIds,
        mapSsrcConsumerId: mapSsrcConsumerId,
        mapRtxSsrcConsumerId: mapRtxSsrcConsumerId,
        dataProducerIds: dataProducerIds,
        dataConsumerIds: dataConsumerIds,
        recvRtpHeaderExtensions: recvRtpHeaderExtensions,
        rtpListener: rtpListener,
        maxMessageSize: binary.maxMessageSize(),
        sctpParameters: sctpParameters,
        sctpState: sctpState,
        sctpListener: sctpListener,
        traceEventTypes: traceEventTypes
    };
}
exports.parseBaseTransportDump = parseBaseTransportDump;
function parseBaseTransportStats(binary) {
    const sctpState = binary.sctpState() === null ? undefined : parseSctpState(binary.sctpState());
    return {
        transportId: binary.transportId(),
        timestamp: Number(binary.timestamp()),
        sctpState,
        bytesReceived: Number(binary.bytesReceived()),
        recvBitrate: Number(binary.recvBitrate()),
        bytesSent: Number(binary.bytesSent()),
        sendBitrate: Number(binary.sendBitrate()),
        rtpBytesReceived: Number(binary.rtpBytesReceived()),
        rtpRecvBitrate: Number(binary.rtpRecvBitrate()),
        rtpBytesSent: Number(binary.rtpBytesSent()),
        rtpSendBitrate: Number(binary.rtpSendBitrate()),
        rtxBytesReceived: Number(binary.rtxBytesReceived()),
        rtxRecvBitrate: Number(binary.rtxRecvBitrate()),
        rtxBytesSent: Number(binary.rtxBytesSent()),
        rtxSendBitrate: Number(binary.rtxSendBitrate()),
        probationBytesSent: Number(binary.probationBytesSent()),
        probationSendBitrate: Number(binary.probationSendBitrate()),
        availableOutgoingBitrate: Number(binary.availableOutgoingBitrate()),
        availableIncomingBitrate: Number(binary.availableIncomingBitrate()),
        maxIncomingBitrate: binary.maxIncomingBitrate() ?
            Number(binary.maxIncomingBitrate()) :
            undefined
    };
}
exports.parseBaseTransportStats = parseBaseTransportStats;
function parseTransportTraceEventData(trace) {
    switch (trace.type()) {
        case FbsTransport.TraceEventType.BWE:
            {
                const info = new FbsTransport.BweTraceInfo();
                trace.info(info);
                return {
                    type: 'bwe',
                    timestamp: Number(trace.timestamp()),
                    direction: trace.direction() === common_1.TraceDirection.DIRECTION_IN ? 'in' : 'out',
                    info: parseBweTraceInfo(info)
                };
            }
        case FbsTransport.TraceEventType.PROBATION:
            {
                return {
                    type: 'probation',
                    timestamp: Number(trace.timestamp()),
                    direction: trace.direction() === common_1.TraceDirection.DIRECTION_IN ? 'in' : 'out',
                    info: {}
                };
            }
    }
}
exports.parseTransportTraceEventData = parseTransportTraceEventData;
function parseRecvRtpHeaderExtensions(binary) {
    return {
        mid: binary.mid() !== null ? binary.mid() : undefined,
        rid: binary.rid() !== null ? binary.rid() : undefined,
        rrid: binary.rrid() !== null ? binary.rrid() : undefined,
        absSendTime: binary.absSendTime() !== null ? binary.absSendTime() : undefined,
        transportWideCc01: binary.transportWideCc01() !== null ?
            binary.transportWideCc01() :
            undefined
    };
}
function parseBweTraceInfo(binary) {
    return {
        desiredBitrate: binary.desiredBitrate(),
        effectiveDesiredBitrate: binary.effectiveDesiredBitrate(),
        minBitrate: binary.minBitrate(),
        maxBitrate: binary.maxBitrate(),
        startBitrate: binary.startBitrate(),
        maxPaddingBitrate: binary.maxPaddingBitrate(),
        availableBitrate: binary.availableBitrate(),
        bweType: binary.bweType() === FbsTransport.BweType.TRANSPORT_CC ?
            'transport-cc' :
            'remb'
    };
}
function createConsumeRequest({ builder, producer, consumerId, rtpParameters, paused, preferredLayers, ignoreDtx, pipe }) {
    const rtpParametersOffset = (0, RtpParameters_1.serializeRtpParameters)(builder, rtpParameters);
    const consumerIdOffset = builder.createString(consumerId);
    const producerIdOffset = builder.createString(producer.id);
    let consumableRtpEncodingsOffset;
    let preferredLayersOffset;
    if (producer.consumableRtpParameters.encodings) {
        consumableRtpEncodingsOffset = (0, RtpParameters_1.serializeRtpEncodingParameters)(builder, producer.consumableRtpParameters.encodings);
    }
    if (preferredLayers) {
        FbsConsumer.ConsumerLayers.startConsumerLayers(builder);
        FbsConsumer.ConsumerLayers.addSpatialLayer(builder, preferredLayers.spatialLayer);
        if (preferredLayers.temporalLayer !== undefined) {
            FbsConsumer.ConsumerLayers.addTemporalLayer(builder, preferredLayers.temporalLayer);
        }
        preferredLayersOffset = FbsConsumer.ConsumerLayers.endConsumerLayers(builder);
    }
    const ConsumeRequest = FbsTransport.ConsumeRequest;
    // Create Consume Request.
    ConsumeRequest.startConsumeRequest(builder);
    ConsumeRequest.addConsumerId(builder, consumerIdOffset);
    ConsumeRequest.addProducerId(builder, producerIdOffset);
    ConsumeRequest.addKind(builder, producer.kind === 'audio' ? media_kind_1.MediaKind.AUDIO : media_kind_1.MediaKind.VIDEO);
    ConsumeRequest.addRtpParameters(builder, rtpParametersOffset);
    ConsumeRequest.addType(builder, pipe ? FbsRtpParameters.Type.PIPE : (0, Producer_1.producerTypeToFbs)(producer.type));
    if (consumableRtpEncodingsOffset) {
        ConsumeRequest.addConsumableRtpEncodings(builder, consumableRtpEncodingsOffset);
    }
    ConsumeRequest.addPaused(builder, paused);
    if (preferredLayersOffset) {
        ConsumeRequest.addPreferredLayers(builder, preferredLayersOffset);
    }
    ConsumeRequest.addIgnoreDtx(builder, Boolean(ignoreDtx));
    return ConsumeRequest.endConsumeRequest(builder);
}
function createProduceRequest({ builder, producerId, kind, rtpParameters, rtpMapping, keyFrameRequestDelay, paused }) {
    const producerIdOffset = builder.createString(producerId);
    const rtpParametersOffset = (0, RtpParameters_1.serializeRtpParameters)(builder, rtpParameters);
    const rtpMappingOffset = ortc.serializeRtpMapping(builder, rtpMapping);
    FbsTransport.ProduceRequest.startProduceRequest(builder);
    FbsTransport.ProduceRequest.addProducerId(builder, producerIdOffset);
    FbsTransport.ProduceRequest.addKind(builder, kind === 'audio' ? media_kind_1.MediaKind.AUDIO : media_kind_1.MediaKind.VIDEO);
    FbsTransport.ProduceRequest.addRtpParameters(builder, rtpParametersOffset);
    FbsTransport.ProduceRequest.addRtpMapping(builder, rtpMappingOffset);
    FbsTransport.ProduceRequest.addKeyFrameRequestDelay(builder, keyFrameRequestDelay ?? 0);
    FbsTransport.ProduceRequest.addPaused(builder, paused);
    return FbsTransport.ProduceRequest.endProduceRequest(builder);
}
function createProduceDataRequest({ builder, dataProducerId, type, sctpStreamParameters, label, protocol, paused }) {
    const dataProducerIdOffset = builder.createString(dataProducerId);
    const labelOffset = builder.createString(label);
    const protocolOffset = builder.createString(protocol);
    let sctpStreamParametersOffset = 0;
    if (sctpStreamParameters) {
        sctpStreamParametersOffset = (0, SctpParameters_1.serializeSctpStreamParameters)(builder, sctpStreamParameters);
    }
    FbsTransport.ProduceDataRequest.startProduceDataRequest(builder);
    FbsTransport.ProduceDataRequest.addDataProducerId(builder, dataProducerIdOffset);
    FbsTransport.ProduceDataRequest.addType(builder, (0, DataProducer_1.dataProducerTypeToFbs)(type));
    if (sctpStreamParametersOffset) {
        FbsTransport.ProduceDataRequest.addSctpStreamParameters(builder, sctpStreamParametersOffset);
    }
    FbsTransport.ProduceDataRequest.addLabel(builder, labelOffset);
    FbsTransport.ProduceDataRequest.addProtocol(builder, protocolOffset);
    FbsTransport.ProduceDataRequest.addPaused(builder, paused);
    return FbsTransport.ProduceDataRequest.endProduceDataRequest(builder);
}
function createConsumeDataRequest({ builder, dataConsumerId, dataProducerId, type, sctpStreamParameters, label, protocol, paused, subchannels = [] }) {
    const dataConsumerIdOffset = builder.createString(dataConsumerId);
    const dataProducerIdOffset = builder.createString(dataProducerId);
    const labelOffset = builder.createString(label);
    const protocolOffset = builder.createString(protocol);
    let sctpStreamParametersOffset = 0;
    if (sctpStreamParameters) {
        sctpStreamParametersOffset = (0, SctpParameters_1.serializeSctpStreamParameters)(builder, sctpStreamParameters);
    }
    const subchannelsOffset = FbsTransport.ConsumeDataRequest.createSubchannelsVector(builder, subchannels);
    FbsTransport.ConsumeDataRequest.startConsumeDataRequest(builder);
    FbsTransport.ConsumeDataRequest.addDataConsumerId(builder, dataConsumerIdOffset);
    FbsTransport.ConsumeDataRequest.addDataProducerId(builder, dataProducerIdOffset);
    FbsTransport.ConsumeDataRequest.addType(builder, (0, DataConsumer_1.dataConsumerTypeToFbs)(type));
    if (sctpStreamParametersOffset) {
        FbsTransport.ConsumeDataRequest.addSctpStreamParameters(builder, sctpStreamParametersOffset);
    }
    FbsTransport.ConsumeDataRequest.addLabel(builder, labelOffset);
    FbsTransport.ConsumeDataRequest.addProtocol(builder, protocolOffset);
    FbsTransport.ConsumeDataRequest.addPaused(builder, paused);
    FbsTransport.ConsumeDataRequest.addSubchannels(builder, subchannelsOffset);
    return FbsTransport.ConsumeDataRequest.endConsumeDataRequest(builder);
}
function parseRtpListenerDump(binary) {
    // Retrieve ssrcTable.
    const ssrcTable = utils.parseUint32StringVector(binary, 'ssrcTable');
    // Retrieve midTable.
    const midTable = utils.parseUint32StringVector(binary, 'midTable');
    // Retrieve ridTable.
    const ridTable = utils.parseUint32StringVector(binary, 'ridTable');
    return {
        ssrcTable,
        midTable,
        ridTable
    };
}
function parseSctpListenerDump(binary) {
    // Retrieve streamIdTable.
    const streamIdTable = utils.parseUint32StringVector(binary, 'streamIdTable');
    return {
        streamIdTable
    };
}
