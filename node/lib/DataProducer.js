"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDataProducerDumpResponse = exports.dataProducerTypeFromFbs = exports.dataProducerTypeToFbs = exports.DataProducer = void 0;
const Logger_1 = require("./Logger");
const EnhancedEventEmitter_1 = require("./EnhancedEventEmitter");
const SctpParameters_1 = require("./SctpParameters");
const FbsTransport = require("./fbs/transport");
const FbsNotification = require("./fbs/notification");
const FbsRequest = require("./fbs/request");
const FbsDataProducer = require("./fbs/data-producer");
const logger = new Logger_1.Logger('DataProducer');
class DataProducer extends EnhancedEventEmitter_1.EnhancedEventEmitter {
    // Internal data.
    #internal;
    // DataProducer data.
    #data;
    // Channel instance.
    #channel;
    // Closed flag.
    #closed = false;
    // Paused flag.
    #paused = false;
    // Custom app data.
    #appData;
    // Observer instance.
    #observer = new EnhancedEventEmitter_1.EnhancedEventEmitter();
    /**
     * @private
     */
    constructor({ internal, data, channel, paused, appData }) {
        super();
        logger.debug('constructor()');
        this.#internal = internal;
        this.#data = data;
        this.#channel = channel;
        this.#paused = paused;
        this.#appData = appData || {};
        this.handleWorkerNotifications();
    }
    /**
     * DataProducer id.
     */
    get id() {
        return this.#internal.dataProducerId;
    }
    /**
     * Whether the DataProducer is closed.
     */
    get closed() {
        return this.#closed;
    }
    /**
     * DataProducer type.
     */
    get type() {
        return this.#data.type;
    }
    /**
     * SCTP stream parameters.
     */
    get sctpStreamParameters() {
        return this.#data.sctpStreamParameters;
    }
    /**
     * DataChannel label.
     */
    get label() {
        return this.#data.label;
    }
    /**
     * DataChannel protocol.
     */
    get protocol() {
        return this.#data.protocol;
    }
    /**
     * Whether the DataProducer is paused.
     */
    get paused() {
        return this.#paused;
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
     * Close the DataProducer.
     */
    close() {
        if (this.#closed) {
            return;
        }
        logger.debug('close()');
        this.#closed = true;
        // Remove notification subscriptions.
        this.#channel.removeAllListeners(this.#internal.dataProducerId);
        /* Build Request. */
        const requestOffset = new FbsTransport.CloseDataProducerRequestT(this.#internal.dataProducerId).pack(this.#channel.bufferBuilder);
        this.#channel.request(FbsRequest.Method.TRANSPORT_CLOSE_DATAPRODUCER, FbsRequest.Body.Transport_CloseDataProducerRequest, requestOffset, this.#internal.transportId).catch(() => { });
        this.emit('@close');
        // Emit observer event.
        this.#observer.safeEmit('close');
    }
    /**
     * Transport was closed.
     *
     * @private
     */
    transportClosed() {
        if (this.#closed) {
            return;
        }
        logger.debug('transportClosed()');
        this.#closed = true;
        // Remove notification subscriptions.
        this.#channel.removeAllListeners(this.#internal.dataProducerId);
        this.safeEmit('transportclose');
        // Emit observer event.
        this.#observer.safeEmit('close');
    }
    /**
     * Dump DataProducer.
     */
    async dump() {
        logger.debug('dump()');
        const response = await this.#channel.request(FbsRequest.Method.DATAPRODUCER_DUMP, undefined, undefined, this.#internal.dataProducerId);
        /* Decode Response. */
        const produceResponse = new FbsDataProducer.DumpResponse();
        response.body(produceResponse);
        return parseDataProducerDumpResponse(produceResponse);
    }
    /**
     * Get DataProducer stats.
     */
    async getStats() {
        logger.debug('getStats()');
        const response = await this.#channel.request(FbsRequest.Method.DATAPRODUCER_GET_STATS, undefined, undefined, this.#internal.dataProducerId);
        /* Decode Response. */
        const data = new FbsDataProducer.GetStatsResponse();
        response.body(data);
        return [parseDataProducerStats(data)];
    }
    /**
     * Pause the DataProducer.
     */
    async pause() {
        logger.debug('pause()');
        const wasPaused = this.#paused;
        await this.#channel.request(FbsRequest.Method.DATAPRODUCER_PAUSE, undefined, undefined, this.#internal.dataProducerId);
        this.#paused = true;
        // Emit observer event.
        if (!wasPaused) {
            this.#observer.safeEmit('pause');
        }
    }
    /**
     * Resume the DataProducer.
     */
    async resume() {
        logger.debug('resume()');
        const wasPaused = this.#paused;
        await this.#channel.request(FbsRequest.Method.DATAPRODUCER_RESUME, undefined, undefined, this.#internal.dataProducerId);
        this.#paused = false;
        // Emit observer event.
        if (wasPaused) {
            this.#observer.safeEmit('resume');
        }
    }
    /**
     * Send data (just valid for DataProducers created on a DirectTransport).
     */
    send(message, ppid, subchannels, requiredSubchannel) {
        if (typeof message !== 'string' && !Buffer.isBuffer(message)) {
            throw new TypeError('message must be a string or a Buffer');
        }
        /*
         * +-------------------------------+----------+
         * | Value                         | SCTP     |
         * |                               | PPID     |
         * +-------------------------------+----------+
         * | WebRTC String                 | 51       |
         * | WebRTC Binary Partial         | 52       |
         * | (Deprecated)                  |          |
         * | WebRTC Binary                 | 53       |
         * | WebRTC String Partial         | 54       |
         * | (Deprecated)                  |          |
         * | WebRTC String Empty           | 56       |
         * | WebRTC Binary Empty           | 57       |
         * +-------------------------------+----------+
         */
        if (typeof ppid !== 'number') {
            ppid = (typeof message === 'string')
                ? message.length > 0 ? 51 : 56
                : message.length > 0 ? 53 : 57;
        }
        // Ensure we honor PPIDs.
        if (ppid === 56) {
            message = ' ';
        }
        else if (ppid === 57) {
            message = Buffer.alloc(1);
        }
        const builder = this.#channel.bufferBuilder;
        let dataOffset = 0;
        const subchannelsOffset = FbsDataProducer.SendNotification.createSubchannelsVector(builder, subchannels ?? []);
        if (typeof message === 'string') {
            message = Buffer.from(message);
        }
        dataOffset = FbsDataProducer.SendNotification.createDataVector(builder, message);
        const notificationOffset = FbsDataProducer.SendNotification.createSendNotification(builder, ppid, dataOffset, subchannelsOffset, requiredSubchannel ?? null);
        this.#channel.notify(FbsNotification.Event.DATAPRODUCER_SEND, FbsNotification.Body.DataProducer_SendNotification, notificationOffset, this.#internal.dataProducerId);
    }
    handleWorkerNotifications() {
        // No need to subscribe to any event.
    }
}
exports.DataProducer = DataProducer;
function dataProducerTypeToFbs(type) {
    switch (type) {
        case 'sctp':
            return FbsDataProducer.Type.SCTP;
        case 'direct':
            return FbsDataProducer.Type.DIRECT;
        default:
            throw new TypeError('invalid DataConsumerType: ${type}');
    }
}
exports.dataProducerTypeToFbs = dataProducerTypeToFbs;
function dataProducerTypeFromFbs(type) {
    switch (type) {
        case FbsDataProducer.Type.SCTP:
            return 'sctp';
        case FbsDataProducer.Type.DIRECT:
            return 'direct';
    }
}
exports.dataProducerTypeFromFbs = dataProducerTypeFromFbs;
function parseDataProducerDumpResponse(data) {
    return {
        id: data.id(),
        type: dataProducerTypeFromFbs(data.type()),
        sctpStreamParameters: data.sctpStreamParameters() !== null ?
            (0, SctpParameters_1.parseSctpStreamParameters)(data.sctpStreamParameters()) :
            undefined,
        label: data.label(),
        protocol: data.protocol(),
        paused: data.paused()
    };
}
exports.parseDataProducerDumpResponse = parseDataProducerDumpResponse;
function parseDataProducerStats(binary) {
    return {
        type: 'data-producer',
        timestamp: Number(binary.timestamp()),
        label: binary.label(),
        protocol: binary.protocol(),
        messagesReceived: Number(binary.messagesReceived()),
        bytesReceived: Number(binary.bytesReceived())
    };
}
