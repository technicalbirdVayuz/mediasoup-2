"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRouterDumpResponse = exports.Router = void 0;
const Logger_1 = require("./Logger");
const EnhancedEventEmitter_1 = require("./EnhancedEventEmitter");
const ortc = require("./ortc");
const errors_1 = require("./errors");
const WebRtcTransport_1 = require("./WebRtcTransport");
const PlainTransport_1 = require("./PlainTransport");
const PipeTransport_1 = require("./PipeTransport");
const DirectTransport_1 = require("./DirectTransport");
const ActiveSpeakerObserver_1 = require("./ActiveSpeakerObserver");
const AudioLevelObserver_1 = require("./AudioLevelObserver");
const SrtpParameters_1 = require("./SrtpParameters");
const utils_1 = require("./utils");
const FbsActiveSpeakerObserver = require("./fbs/active-speaker-observer");
const FbsAudioLevelObserver = require("./fbs/audio-level-observer");
const FbsRequest = require("./fbs/request");
const FbsWorker = require("./fbs/worker");
const FbsRouter = require("./fbs/router");
const FbsTransport = require("./fbs/transport");
const protocol_1 = require("./fbs/transport/protocol");
const FbsWebRtcTransport = require("./fbs/web-rtc-transport");
const FbsPlainTransport = require("./fbs/plain-transport");
const FbsPipeTransport = require("./fbs/pipe-transport");
const FbsDirectTransport = require("./fbs/direct-transport");
const FbsSctpParameters = require("./fbs/sctp-parameters");
const logger = new Logger_1.Logger('Router');
class Router extends EnhancedEventEmitter_1.EnhancedEventEmitter {
    // Internal data.
    #internal;
    // Router data.
    #data;
    // Channel instance.
    #channel;
    // Closed flag.
    #closed = false;
    // Custom app data.
    #appData;
    // Transports map.
    #transports = new Map();
    // Producers map.
    #producers = new Map();
    // RtpObservers map.
    #rtpObservers = new Map();
    // DataProducers map.
    #dataProducers = new Map();
    // Map of PipeTransport pair Promises indexed by the id of the Router in
    // which pipeToRouter() was called.
    #mapRouterPairPipeTransportPairPromise = new Map();
    // Observer instance.
    #observer = new EnhancedEventEmitter_1.EnhancedEventEmitter();
    /**
     * @private
     */
    constructor({ internal, data, channel, appData }) {
        super();
        logger.debug('constructor()');
        this.#internal = internal;
        this.#data = data;
        this.#channel = channel;
        this.#appData = appData || {};
    }
    /**
     * Router id.
     */
    get id() {
        return this.#internal.routerId;
    }
    /**
     * Whether the Router is closed.
     */
    get closed() {
        return this.#closed;
    }
    /**
     * RTP capabilities of the Router.
     */
    get rtpCapabilities() {
        return this.#data.rtpCapabilities;
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
    get transportsForTesting() {
        return this.#transports;
    }
    /**
     * Close the Router.
     */
    close() {
        if (this.#closed) {
            return;
        }
        logger.debug('close()');
        this.#closed = true;
        const requestOffset = new FbsWorker.CloseRouterRequestT(this.#internal.routerId).pack(this.#channel.bufferBuilder);
        this.#channel.request(FbsRequest.Method.WORKER_CLOSE_ROUTER, FbsRequest.Body.Worker_CloseRouterRequest, requestOffset)
            .catch(() => { });
        // Close every Transport.
        for (const transport of this.#transports.values()) {
            transport.routerClosed();
        }
        this.#transports.clear();
        // Clear the Producers map.
        this.#producers.clear();
        // Close every RtpObserver.
        for (const rtpObserver of this.#rtpObservers.values()) {
            rtpObserver.routerClosed();
        }
        this.#rtpObservers.clear();
        // Clear the DataProducers map.
        this.#dataProducers.clear();
        this.emit('@close');
        // Emit observer event.
        this.#observer.safeEmit('close');
    }
    /**
     * Worker was closed.
     *
     * @private
     */
    workerClosed() {
        if (this.#closed) {
            return;
        }
        logger.debug('workerClosed()');
        this.#closed = true;
        // Close every Transport.
        for (const transport of this.#transports.values()) {
            transport.routerClosed();
        }
        this.#transports.clear();
        // Clear the Producers map.
        this.#producers.clear();
        // Close every RtpObserver.
        for (const rtpObserver of this.#rtpObservers.values()) {
            rtpObserver.routerClosed();
        }
        this.#rtpObservers.clear();
        // Clear the DataProducers map.
        this.#dataProducers.clear();
        this.safeEmit('workerclose');
        // Emit observer event.
        this.#observer.safeEmit('close');
    }
    /**
     * Dump Router.
     */
    async dump() {
        logger.debug('dump()');
        // Send the request and wait for the response.
        const response = await this.#channel.request(FbsRequest.Method.ROUTER_DUMP, undefined, undefined, this.#internal.routerId);
        /* Decode Response. */
        const dump = new FbsRouter.DumpResponse();
        response.body(dump);
        return parseRouterDumpResponse(dump);
    }
    /**
     * Create a WebRtcTransport.
     */
    async createWebRtcTransport({ webRtcServer, listenInfos, listenIps, port, enableUdp, enableTcp, preferUdp = false, preferTcp = false, initialAvailableOutgoingBitrate = 600000, enableSctp = false, numSctpStreams = { OS: 1024, MIS: 1024 }, maxSctpMessageSize = 262144, sctpSendBufferSize = 262144, appData }) {
        logger.debug('createWebRtcTransport()');
        if (!webRtcServer && !Array.isArray(listenInfos) && !Array.isArray(listenIps)) {
            throw new TypeError('missing webRtcServer, listenInfos and listenIps (one of them is mandatory)');
        }
        else if (webRtcServer && listenInfos && listenIps) {
            throw new TypeError('only one of webRtcServer, listenInfos and listenIps must be given');
        }
        else if (numSctpStreams &&
            (typeof numSctpStreams.OS !== 'number' || typeof numSctpStreams.MIS !== 'number')) {
            throw new TypeError('if given, numSctpStreams must contain OS and MIS');
        }
        else if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        // If webRtcServer is given, then do not force default values for enableUdp
        // and enableTcp. Otherwise set them if unset.
        enableUdp = true;
        enableTcp = true;
        // if (webRtcServer) {
        //     enableUdp ??= true;
        //     enableTcp ??= true;
        // }
        // else {
        //     enableUdp ??= true;
        //     enableTcp ??= false;
        // }
        // Convert deprecated TransportListenIps to TransportListenInfos.
        if (listenIps) {
            // Normalize IP strings to TransportListenIp objects.
            listenIps = listenIps.map((listenIp) => {
                if (typeof listenIp === 'string') {
                    return { ip: listenIp };
                }
                else {
                    return listenIp;
                }
            });
            listenInfos = [];
            const orderedProtocols = [];
            if (enableUdp && (!enableTcp || preferUdp)) {
                orderedProtocols.push('udp');
                if (enableTcp) {
                    orderedProtocols.push('tcp');
                }
            }
            else if (enableTcp && (!enableUdp || (preferTcp && !preferUdp))) {
                orderedProtocols.push('tcp');
                if (enableUdp) {
                    orderedProtocols.push('udp');
                }
            }
            for (const listenIp of listenIps) {
                for (const protocol of orderedProtocols) {
                    listenInfos.push({
                        protocol: protocol,
                        ip: listenIp.ip,
                        announcedIp: listenIp.announcedIp,
                        port: port
                    });
                }
            }
        }
        const transportId = (0, utils_1.generateUUIDv4)();
        /* Build Request. */
        let webRtcTransportListenServer;
        let webRtcTransportListenIndividual;
        if (webRtcServer) {
            webRtcTransportListenServer =
                new FbsWebRtcTransport.ListenServerT(webRtcServer.id);
        }
        else {
            const fbsListenInfos = [];
            for (const listenInfo of listenInfos) {
                fbsListenInfos.push(new FbsTransport.ListenInfoT(listenInfo.protocol === 'udp'
                    ? protocol_1.Protocol.UDP
                    : protocol_1.Protocol.TCP, listenInfo.ip, listenInfo.announcedIp, listenInfo.port, listenInfo.sendBufferSize, listenInfo.recvBufferSize));
            }
            webRtcTransportListenIndividual =
                new FbsWebRtcTransport.ListenIndividualT(fbsListenInfos);
        }
        const baseTransportOptions = new FbsTransport.OptionsT(undefined /* direct */, undefined /* maxMessageSize */, initialAvailableOutgoingBitrate, enableSctp, new FbsSctpParameters.NumSctpStreamsT(numSctpStreams.OS, numSctpStreams.MIS), maxSctpMessageSize, sctpSendBufferSize, true /* isDataChannel */);
        const webRtcTransportOptions = new FbsWebRtcTransport.WebRtcTransportOptionsT(baseTransportOptions, webRtcServer ?
            FbsWebRtcTransport.Listen.ListenServer :
            FbsWebRtcTransport.Listen.ListenIndividual, webRtcServer ? webRtcTransportListenServer : webRtcTransportListenIndividual, enableUdp, enableTcp, preferUdp, preferTcp);
        const requestOffset = new FbsRouter.CreateWebRtcTransportRequestT(transportId, webRtcTransportOptions).pack(this.#channel.bufferBuilder);
        const response = await this.#channel.request(webRtcServer
            ? FbsRequest.Method.ROUTER_CREATE_WEBRTCTRANSPORT_WITH_SERVER
            : FbsRequest.Method.ROUTER_CREATE_WEBRTCTRANSPORT, FbsRequest.Body.Router_CreateWebRtcTransportRequest, requestOffset, this.#internal.routerId);
        /* Decode Response. */
        const data = new FbsWebRtcTransport.DumpResponse();
        response.body(data);
        const webRtcTransportData = (0, WebRtcTransport_1.parseWebRtcTransportDumpResponse)(data);
        const transport = new WebRtcTransport_1.WebRtcTransport({
            internal: {
                ...this.#internal,
                transportId: transportId
            },
            data: webRtcTransportData,
            channel: this.#channel,
            appData,
            getRouterRtpCapabilities: () => this.#data.rtpCapabilities,
            getProducerById: (producerId) => (this.#producers.get(producerId)),
            getDataProducerById: (dataProducerId) => (this.#dataProducers.get(dataProducerId))
        });
        this.#transports.set(transport.id, transport);
        transport.on('@close', () => this.#transports.delete(transport.id));
        transport.on('@listenserverclose', () => this.#transports.delete(transport.id));
        transport.on('@newproducer', (producer) => this.#producers.set(producer.id, producer));
        transport.on('@producerclose', (producer) => this.#producers.delete(producer.id));
        transport.on('@newdataproducer', (dataProducer) => (this.#dataProducers.set(dataProducer.id, dataProducer)));
        transport.on('@dataproducerclose', (dataProducer) => (this.#dataProducers.delete(dataProducer.id)));
        // Emit observer event.
        this.#observer.safeEmit('newtransport', transport);
        if (webRtcServer) {
            webRtcServer.handleWebRtcTransport(transport);
        }
        return transport;
    }
    /**
     * Create a PlainTransport.
     */
    async createPlainTransport({ listenInfo, rtcpListenInfo, listenIp, port, rtcpMux = true, comedia = false, enableSctp = false, numSctpStreams = { OS: 1024, MIS: 1024 }, maxSctpMessageSize = 262144, sctpSendBufferSize = 262144, enableSrtp = false, srtpCryptoSuite = 'AES_CM_128_HMAC_SHA1_80', appData }) {
        logger.debug('createPlainTransport()');
        if (!listenInfo && !listenIp) {
            throw new TypeError('missing listenInfo and listenIp (one of them is mandatory)');
        }
        else if (listenInfo && listenIp) {
            throw new TypeError('only one of listenInfo and listenIp must be given');
        }
        else if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        // If rtcpMux is enabled, ignore rtcpListenInfo.
        if (rtcpMux) {
            logger.warn('createPlainTransport() | ignoring given rtcpListenInfo since rtcpMux is enabled');
            rtcpListenInfo = undefined;
        }
        // Convert deprecated TransportListenIps to TransportListenInfos.
        if (listenIp) {
            // Normalize IP string to TransportListenIp object.
            if (typeof listenIp === 'string') {
                listenIp = { ip: listenIp };
            }
            listenInfo =
                {
                    protocol: 'udp',
                    ip: listenIp.ip,
                    announcedIp: listenIp.announcedIp,
                    port: port
                };
        }
        const transportId = (0, utils_1.generateUUIDv4)();
        /* Build Request. */
        const baseTransportOptions = new FbsTransport.OptionsT(undefined /* direct */, undefined /* maxMessageSize */, undefined /* initialAvailableOutgoingBitrate */, enableSctp, new FbsSctpParameters.NumSctpStreamsT(numSctpStreams.OS, numSctpStreams.MIS), maxSctpMessageSize, sctpSendBufferSize, false /* isDataChannel */);
        const plainTransportOptions = new FbsPlainTransport.PlainTransportOptionsT(baseTransportOptions, new FbsTransport.ListenInfoT(listenInfo.protocol === 'udp'
            ? protocol_1.Protocol.UDP
            : protocol_1.Protocol.TCP, listenInfo.ip, listenInfo.announcedIp, listenInfo.port, listenInfo.sendBufferSize, listenInfo.recvBufferSize), rtcpListenInfo ? new FbsTransport.ListenInfoT(rtcpListenInfo.protocol === 'udp'
            ? protocol_1.Protocol.UDP
            : protocol_1.Protocol.TCP, rtcpListenInfo.ip, rtcpListenInfo.announcedIp, rtcpListenInfo.port, rtcpListenInfo.sendBufferSize, rtcpListenInfo.recvBufferSize) : undefined, rtcpMux, comedia, enableSrtp, (0, SrtpParameters_1.cryptoSuiteToFbs)(srtpCryptoSuite));
        const requestOffset = new FbsRouter.CreatePlainTransportRequestT(transportId, plainTransportOptions).pack(this.#channel.bufferBuilder);
        const response = await this.#channel.request(FbsRequest.Method.ROUTER_CREATE_PLAINTRANSPORT, FbsRequest.Body.Router_CreatePlainTransportRequest, requestOffset, this.#internal.routerId);
        /* Decode Response. */
        const data = new FbsPlainTransport.DumpResponse();
        response.body(data);
        const plainTransportData = (0, PlainTransport_1.parsePlainTransportDumpResponse)(data);
        const transport = new PlainTransport_1.PlainTransport({
            internal: {
                ...this.#internal,
                transportId: transportId
            },
            data: plainTransportData,
            channel: this.#channel,
            appData,
            getRouterRtpCapabilities: () => this.#data.rtpCapabilities,
            getProducerById: (producerId) => (this.#producers.get(producerId)),
            getDataProducerById: (dataProducerId) => (this.#dataProducers.get(dataProducerId))
        });
        this.#transports.set(transport.id, transport);
        transport.on('@close', () => this.#transports.delete(transport.id));
        transport.on('@listenserverclose', () => this.#transports.delete(transport.id));
        transport.on('@newproducer', (producer) => this.#producers.set(producer.id, producer));
        transport.on('@producerclose', (producer) => this.#producers.delete(producer.id));
        transport.on('@newdataproducer', (dataProducer) => (this.#dataProducers.set(dataProducer.id, dataProducer)));
        transport.on('@dataproducerclose', (dataProducer) => (this.#dataProducers.delete(dataProducer.id)));
        // Emit observer event.
        this.#observer.safeEmit('newtransport', transport);
        return transport;
    }
    /**
     * Create a PipeTransport.
     */
    async createPipeTransport({ listenInfo, listenIp, port, enableSctp = false, numSctpStreams = { OS: 1024, MIS: 1024 }, maxSctpMessageSize = 268435456, sctpSendBufferSize = 268435456, enableRtx = false, enableSrtp = false, appData }) {
        logger.debug('createPipeTransport()');
        if (!listenInfo && !listenIp) {
            throw new TypeError('missing listenInfo and listenIp (one of them is mandatory)');
        }
        else if (listenInfo && listenIp) {
            throw new TypeError('only one of listenInfo and listenIp must be given');
        }
        else if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        // Convert deprecated TransportListenIps to TransportListenInfos.
        if (listenIp) {
            // Normalize IP string to TransportListenIp object.
            if (typeof listenIp === 'string') {
                listenIp = { ip: listenIp };
            }
            listenInfo =
                {
                    protocol: 'udp',
                    ip: listenIp.ip,
                    announcedIp: listenIp.announcedIp,
                    port: port
                };
        }
        const transportId = (0, utils_1.generateUUIDv4)();
        /* Build Request. */
        const baseTransportOptions = new FbsTransport.OptionsT(undefined /* direct */, undefined /* maxMessageSize */, undefined /* initialAvailableOutgoingBitrate */, enableSctp, new FbsSctpParameters.NumSctpStreamsT(numSctpStreams.OS, numSctpStreams.MIS), maxSctpMessageSize, sctpSendBufferSize, false /* isDataChannel */);
        const pipeTransportOptions = new FbsPipeTransport.PipeTransportOptionsT(baseTransportOptions, new FbsTransport.ListenInfoT(listenInfo.protocol === 'udp'
            ? protocol_1.Protocol.UDP
            : protocol_1.Protocol.TCP, listenInfo.ip, listenInfo.announcedIp, listenInfo.port, listenInfo.sendBufferSize, listenInfo.recvBufferSize), enableRtx, enableSrtp);
        const requestOffset = new FbsRouter.CreatePipeTransportRequestT(transportId, pipeTransportOptions).pack(this.#channel.bufferBuilder);
        const response = await this.#channel.request(FbsRequest.Method.ROUTER_CREATE_PIPETRANSPORT, FbsRequest.Body.Router_CreatePipeTransportRequest, requestOffset, this.#internal.routerId);
        /* Decode Response. */
        const data = new FbsPipeTransport.DumpResponse();
        response.body(data);
        const plainTransportData = (0, PipeTransport_1.parsePipeTransportDumpResponse)(data);
        const transport = new PipeTransport_1.PipeTransport({
            internal: {
                ...this.#internal,
                transportId
            },
            data: plainTransportData,
            channel: this.#channel,
            appData,
            getRouterRtpCapabilities: () => this.#data.rtpCapabilities,
            getProducerById: (producerId) => (this.#producers.get(producerId)),
            getDataProducerById: (dataProducerId) => (this.#dataProducers.get(dataProducerId))
        });
        this.#transports.set(transport.id, transport);
        transport.on('@close', () => this.#transports.delete(transport.id));
        transport.on('@listenserverclose', () => this.#transports.delete(transport.id));
        transport.on('@newproducer', (producer) => this.#producers.set(producer.id, producer));
        transport.on('@producerclose', (producer) => this.#producers.delete(producer.id));
        transport.on('@newdataproducer', (dataProducer) => (this.#dataProducers.set(dataProducer.id, dataProducer)));
        transport.on('@dataproducerclose', (dataProducer) => (this.#dataProducers.delete(dataProducer.id)));
        // Emit observer event.
        this.#observer.safeEmit('newtransport', transport);
        return transport;
    }
    /**
     * Create a DirectTransport.
     */
    async createDirectTransport({ maxMessageSize = 262144, appData } = {
        maxMessageSize: 262144
    }) {
        logger.debug('createDirectTransport()');
        if (typeof maxMessageSize !== 'number' || maxMessageSize < 0) {
            throw new TypeError('if given, maxMessageSize must be a positive number');
        }
        else if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        const transportId = (0, utils_1.generateUUIDv4)();
        /* Build Request. */
        const baseTransportOptions = new FbsTransport.OptionsT(true /* direct */, maxMessageSize, undefined /* initialAvailableOutgoingBitrate */, undefined /* enableSctp */, undefined /* numSctpStreams */, undefined /* maxSctpMessageSize */, undefined /* sctpSendBufferSize */, undefined /* isDataChannel */);
        const directTransportOptions = new FbsDirectTransport.DirectTransportOptionsT(baseTransportOptions);
        const requestOffset = new FbsRouter.CreateDirectTransportRequestT(transportId, directTransportOptions).pack(this.#channel.bufferBuilder);
        const response = await this.#channel.request(FbsRequest.Method.ROUTER_CREATE_DIRECTTRANSPORT, FbsRequest.Body.Router_CreateDirectTransportRequest, requestOffset, this.#internal.routerId);
        /* Decode Response. */
        const data = new FbsDirectTransport.DumpResponse();
        response.body(data);
        const directTransportData = (0, DirectTransport_1.parseDirectTransportDumpResponse)(data);
        const transport = new DirectTransport_1.DirectTransport({
            internal: {
                ...this.#internal,
                transportId: transportId
            },
            data: directTransportData,
            channel: this.#channel,
            appData,
            getRouterRtpCapabilities: () => this.#data.rtpCapabilities,
            getProducerById: (producerId) => (this.#producers.get(producerId)),
            getDataProducerById: (dataProducerId) => (this.#dataProducers.get(dataProducerId))
        });
        this.#transports.set(transport.id, transport);
        transport.on('@close', () => this.#transports.delete(transport.id));
        transport.on('@listenserverclose', () => this.#transports.delete(transport.id));
        transport.on('@newproducer', (producer) => this.#producers.set(producer.id, producer));
        transport.on('@producerclose', (producer) => this.#producers.delete(producer.id));
        transport.on('@newdataproducer', (dataProducer) => (this.#dataProducers.set(dataProducer.id, dataProducer)));
        transport.on('@dataproducerclose', (dataProducer) => (this.#dataProducers.delete(dataProducer.id)));
        // Emit observer event.
        this.#observer.safeEmit('newtransport', transport);
        return transport;
    }
    /**
     * Pipes the given Producer or DataProducer into another Router in same host.
     */
    async pipeToRouter({ producerId, dataProducerId, router, listenInfo, listenIp, enableSctp = true, numSctpStreams = { OS: 1024, MIS: 1024 }, enableRtx = false, enableSrtp = false }) {
        logger.debug('pipeToRouter()');
        if (!listenInfo && !listenIp) {
            listenInfo =
                {
                    protocol: 'udp',
                    ip: '127.0.0.1'
                };
        }
        if (listenInfo && listenIp) {
            throw new TypeError('only one of listenInfo and listenIp must be given');
        }
        else if (!producerId && !dataProducerId) {
            throw new TypeError('missing producerId or dataProducerId');
        }
        else if (producerId && dataProducerId) {
            throw new TypeError('just producerId or dataProducerId can be given');
        }
        else if (!router) {
            throw new TypeError('Router not found');
        }
        else if (router === this) {
            throw new TypeError('cannot use this Router as destination');
        }
        // Convert deprecated TransportListenIps to TransportListenInfos.
        if (listenIp) {
            // Normalize IP string to TransportListenIp object.
            if (typeof listenIp === 'string') {
                listenIp = { ip: listenIp };
            }
            listenInfo =
                {
                    protocol: 'udp',
                    ip: listenIp.ip,
                    announcedIp: listenIp.announcedIp
                };
        }
        let producer;
        let dataProducer;
        if (producerId) {
            producer = this.#producers.get(producerId);
            if (!producer) {
                throw new TypeError('Producer not found');
            }
        }
        else if (dataProducerId) {
            dataProducer = this.#dataProducers.get(dataProducerId);
            if (!dataProducer) {
                throw new TypeError('DataProducer not found');
            }
        }
        const pipeTransportPairKey = router.id;
        let pipeTransportPairPromise = this.#mapRouterPairPipeTransportPairPromise.get(pipeTransportPairKey);
        let pipeTransportPair;
        let localPipeTransport;
        let remotePipeTransport;
        if (pipeTransportPairPromise) {
            pipeTransportPair = await pipeTransportPairPromise;
            localPipeTransport = pipeTransportPair[this.id];
            remotePipeTransport = pipeTransportPair[router.id];
        }
        else {
            pipeTransportPairPromise = new Promise((resolve, reject) => {
                Promise.all([
                    this.createPipeTransport({
                        listenInfo: listenInfo,
                        enableSctp,
                        numSctpStreams,
                        enableRtx,
                        enableSrtp
                    }),
                    router.createPipeTransport({
                        listenInfo: listenInfo,
                        enableSctp,
                        numSctpStreams,
                        enableRtx,
                        enableSrtp
                    })
                ])
                    .then((pipeTransports) => {
                    localPipeTransport = pipeTransports[0];
                    remotePipeTransport = pipeTransports[1];
                })
                    .then(() => {
                    return Promise.all([
                        localPipeTransport.connect({
                            ip: remotePipeTransport.tuple.localIp,
                            port: remotePipeTransport.tuple.localPort,
                            srtpParameters: remotePipeTransport.srtpParameters
                        }),
                        remotePipeTransport.connect({
                            ip: localPipeTransport.tuple.localIp,
                            port: localPipeTransport.tuple.localPort,
                            srtpParameters: localPipeTransport.srtpParameters
                        })
                    ]);
                })
                    .then(() => {
                    localPipeTransport.observer.on('close', () => {
                        remotePipeTransport.close();
                        this.#mapRouterPairPipeTransportPairPromise.delete(pipeTransportPairKey);
                    });
                    remotePipeTransport.observer.on('close', () => {
                        localPipeTransport.close();
                        this.#mapRouterPairPipeTransportPairPromise.delete(pipeTransportPairKey);
                    });
                    resolve({
                        [this.id]: localPipeTransport,
                        [router.id]: remotePipeTransport
                    });
                })
                    .catch((error) => {
                    logger.error('pipeToRouter() | error creating PipeTransport pair:%o', error);
                    if (localPipeTransport) {
                        localPipeTransport.close();
                    }
                    if (remotePipeTransport) {
                        remotePipeTransport.close();
                    }
                    reject(error);
                });
            });
            this.#mapRouterPairPipeTransportPairPromise.set(pipeTransportPairKey, pipeTransportPairPromise);
            router.addPipeTransportPair(this.id, pipeTransportPairPromise);
            await pipeTransportPairPromise;
        }
        if (producer) {
            let pipeConsumer;
            let pipeProducer;
            try {
                pipeConsumer = await localPipeTransport.consume({
                    producerId: producerId
                });
                pipeProducer = await remotePipeTransport.produce({
                    id: producer.id,
                    kind: pipeConsumer.kind,
                    rtpParameters: pipeConsumer.rtpParameters,
                    paused: pipeConsumer.producerPaused,
                    appData: producer.appData
                });
                // Ensure that the producer has not been closed in the meanwhile.
                if (producer.closed) {
                    throw new errors_1.InvalidStateError('original Producer closed');
                }
                // Ensure that producer.paused has not changed in the meanwhile and, if
                // so, sync the pipeProducer.
                if (pipeProducer.paused !== producer.paused) {
                    if (producer.paused) {
                        await pipeProducer.pause();
                    }
                    else {
                        await pipeProducer.resume();
                    }
                }
                // Pipe events from the pipe Consumer to the pipe Producer.
                pipeConsumer.observer.on('close', () => pipeProducer.close());
                pipeConsumer.observer.on('pause', () => pipeProducer.pause());
                pipeConsumer.observer.on('resume', () => pipeProducer.resume());
                // Pipe events from the pipe Producer to the pipe Consumer.
                pipeProducer.observer.on('close', () => pipeConsumer.close());
                return { pipeConsumer, pipeProducer };
            }
            catch (error) {
                logger.error('pipeToRouter() | error creating pipe Consumer/Producer pair:%o', error);
                if (pipeConsumer) {
                    pipeConsumer.close();
                }
                if (pipeProducer) {
                    pipeProducer.close();
                }
                throw error;
            }
        }
        else if (dataProducer) {
            let pipeDataConsumer;
            let pipeDataProducer;
            try {
                pipeDataConsumer = await localPipeTransport.consumeData({
                    dataProducerId: dataProducerId
                });
                pipeDataProducer = await remotePipeTransport.produceData({
                    id: dataProducer.id,
                    sctpStreamParameters: pipeDataConsumer.sctpStreamParameters,
                    label: pipeDataConsumer.label,
                    protocol: pipeDataConsumer.protocol,
                    appData: dataProducer.appData
                });
                // Ensure that the dataProducer has not been closed in the meanwhile.
                if (dataProducer.closed) {
                    throw new errors_1.InvalidStateError('original DataProducer closed');
                }
                // Pipe events from the pipe DataConsumer to the pipe DataProducer.
                pipeDataConsumer.observer.on('close', () => pipeDataProducer.close());
                // Pipe events from the pipe DataProducer to the pipe DataConsumer.
                pipeDataProducer.observer.on('close', () => pipeDataConsumer.close());
                return { pipeDataConsumer, pipeDataProducer };
            }
            catch (error) {
                logger.error('pipeToRouter() | error creating pipe DataConsumer/DataProducer pair:%o', error);
                if (pipeDataConsumer) {
                    pipeDataConsumer.close();
                }
                if (pipeDataProducer) {
                    pipeDataProducer.close();
                }
                throw error;
            }
        }
        else {
            throw new Error('internal error');
        }
    }
    /**
     * @private
     */
    addPipeTransportPair(pipeTransportPairKey, pipeTransportPairPromise) {
        if (this.#mapRouterPairPipeTransportPairPromise.has(pipeTransportPairKey)) {
            throw new Error('given pipeTransportPairKey already exists in this Router');
        }
        this.#mapRouterPairPipeTransportPairPromise.set(pipeTransportPairKey, pipeTransportPairPromise);
        pipeTransportPairPromise
            .then((pipeTransportPair) => {
            const localPipeTransport = pipeTransportPair[this.id];
            // NOTE: No need to do any other cleanup here since that is done by the
            // Router calling this method on us.
            localPipeTransport.observer.on('close', () => {
                this.#mapRouterPairPipeTransportPairPromise.delete(pipeTransportPairKey);
            });
        })
            .catch(() => {
            this.#mapRouterPairPipeTransportPairPromise.delete(pipeTransportPairKey);
        });
    }
    /**
     * Create an ActiveSpeakerObserver
     */
    async createActiveSpeakerObserver({ interval = 300, appData } = {}) {
        logger.debug('createActiveSpeakerObserver()');
        if (typeof interval !== 'number') {
            throw new TypeError('if given, interval must be an number');
        }
        if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        const rtpObserverId = (0, utils_1.generateUUIDv4)();
        /* Build Request. */
        const activeRtpObserverOptions = new FbsActiveSpeakerObserver.ActiveSpeakerObserverOptionsT(interval);
        const requestOffset = new FbsRouter.CreateActiveSpeakerObserverRequestT(rtpObserverId, activeRtpObserverOptions).pack(this.#channel.bufferBuilder);
        await this.#channel.request(FbsRequest.Method.ROUTER_CREATE_ACTIVESPEAKEROBSERVER, FbsRequest.Body.Router_CreateActiveSpeakerObserverRequest, requestOffset, this.#internal.routerId);
        const activeSpeakerObserver = new ActiveSpeakerObserver_1.ActiveSpeakerObserver({
            internal: {
                ...this.#internal,
                rtpObserverId: rtpObserverId
            },
            channel: this.#channel,
            appData,
            getProducerById: (producerId) => (this.#producers.get(producerId))
        });
        this.#rtpObservers.set(activeSpeakerObserver.id, activeSpeakerObserver);
        activeSpeakerObserver.on('@close', () => {
            this.#rtpObservers.delete(activeSpeakerObserver.id);
        });
        // Emit observer event.
        this.#observer.safeEmit('newrtpobserver', activeSpeakerObserver);
        return activeSpeakerObserver;
    }
    /**
     * Create an AudioLevelObserver.
     */
    async createAudioLevelObserver({ maxEntries = 1, threshold = -80, interval = 1000, appData } = {}) {
        logger.debug('createAudioLevelObserver()');
        if (typeof maxEntries !== 'number' || maxEntries <= 0) {
            throw new TypeError('if given, maxEntries must be a positive number');
        }
        if (typeof threshold !== 'number' || threshold < -127 || threshold > 0) {
            throw new TypeError('if given, threshole must be a negative number greater than -127');
        }
        if (typeof interval !== 'number') {
            throw new TypeError('if given, interval must be an number');
        }
        if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        const rtpObserverId = (0, utils_1.generateUUIDv4)();
        /* Build Request. */
        const audioLevelObserverOptions = new FbsAudioLevelObserver.AudioLevelObserverOptionsT(maxEntries, threshold, interval);
        const requestOffset = new FbsRouter.CreateAudioLevelObserverRequestT(rtpObserverId, audioLevelObserverOptions).pack(this.#channel.bufferBuilder);
        await this.#channel.request(FbsRequest.Method.ROUTER_CREATE_AUDIOLEVELOBSERVER, FbsRequest.Body.Router_CreateAudioLevelObserverRequest, requestOffset, this.#internal.routerId);
        const audioLevelObserver = new AudioLevelObserver_1.AudioLevelObserver({
            internal: {
                ...this.#internal,
                rtpObserverId: rtpObserverId
            },
            channel: this.#channel,
            appData,
            getProducerById: (producerId) => (this.#producers.get(producerId))
        });
        this.#rtpObservers.set(audioLevelObserver.id, audioLevelObserver);
        audioLevelObserver.on('@close', () => {
            this.#rtpObservers.delete(audioLevelObserver.id);
        });
        // Emit observer event.
        this.#observer.safeEmit('newrtpobserver', audioLevelObserver);
        return audioLevelObserver;
    }
    /**
     * Check whether the given RTP capabilities can consume the given Producer.
     */
    canConsume({ producerId, rtpCapabilities }) {
        const producer = this.#producers.get(producerId);
        if (!producer) {
            logger.error('canConsume() | Producer with id "%s" not found', producerId);
            return false;
        }
        try {
            return ortc.canConsume(producer.consumableRtpParameters, rtpCapabilities);
        }
        catch (error) {
            logger.error('canConsume() | unexpected error: %s', String(error));
            return false;
        }
    }
}
exports.Router = Router;
function parseRouterDumpResponse(binary) {
    return {
        id: binary.id(),
        transportIds: (0, utils_1.parseVector)(binary, 'transportIds'),
        rtpObserverIds: (0, utils_1.parseVector)(binary, 'rtpObserverIds'),
        mapProducerIdConsumerIds: (0, utils_1.parseStringStringArrayVector)(binary, 'mapProducerIdConsumerIds'),
        mapConsumerIdProducerId: (0, utils_1.parseStringStringVector)(binary, 'mapConsumerIdProducerId'),
        mapProducerIdObserverIds: (0, utils_1.parseStringStringArrayVector)(binary, 'mapProducerIdObserverIds'),
        mapDataProducerIdDataConsumerIds: (0, utils_1.parseStringStringArrayVector)(binary, 'mapDataProducerIdDataConsumerIds'),
        mapDataConsumerIdDataProducerId: (0, utils_1.parseStringStringVector)(binary, 'mapDataConsumerIdDataProducerId')
    };
}
exports.parseRouterDumpResponse = parseRouterDumpResponse;
