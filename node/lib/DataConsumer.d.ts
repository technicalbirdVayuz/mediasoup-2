/// <reference types="node" />
import { EnhancedEventEmitter } from './EnhancedEventEmitter';
import { Channel } from './Channel';
import { TransportInternal } from './Transport';
import { SctpStreamParameters } from './SctpParameters';
import { AppData } from './types';
import * as FbsDataConsumer from './fbs/data-consumer';
import * as FbsDataProducer from './fbs/data-producer';
export type DataConsumerOptions<DataConsumerAppData extends AppData = AppData> = {
    /**
     * The id of the DataProducer to consume.
     */
    dataProducerId: string;
    /**
     * Just if consuming over SCTP.
     * Whether data messages must be received in order. If true the messages will
     * be sent reliably. Defaults to the value in the DataProducer if it has type
     * 'sctp' or to true if it has type 'direct'.
     */
    ordered?: boolean;
    /**
     * Just if consuming over SCTP.
     * When ordered is false indicates the time (in milliseconds) after which a
     * SCTP packet will stop being retransmitted. Defaults to the value in the
     * DataProducer if it has type 'sctp' or unset if it has type 'direct'.
     */
    maxPacketLifeTime?: number;
    /**
     * Just if consuming over SCTP.
     * When ordered is false indicates the maximum number of times a packet will
     * be retransmitted. Defaults to the value in the DataProducer if it has type
     * 'sctp' or unset if it has type 'direct'.
     */
    maxRetransmits?: number;
    /**
     * Whether the data consumer must start in paused mode. Default false.
     */
    paused?: boolean;
    /**
     * Subchannels this data consumer initially subscribes to.
     * Only used in case this data consumer receives messages from a local data
     * producer that specifies subchannel(s) when calling send().
     */
    subchannels?: number[];
    /**
     * Custom application data.
     */
    appData?: DataConsumerAppData;
};
export type DataConsumerStat = {
    type: string;
    timestamp: number;
    label: string;
    protocol: string;
    messagesSent: number;
    bytesSent: number;
    bufferedAmount: number;
};
/**
 * DataConsumer type.
 */
export type DataConsumerType = 'sctp' | 'direct';
export type DataConsumerEvents = {
    transportclose: [];
    dataproducerclose: [];
    dataproducerpause: [];
    dataproducerresume: [];
    message: [Buffer, number];
    sctpsendbufferfull: [];
    bufferedamountlow: [number];
    '@close': [];
    '@dataproducerclose': [];
};
export type DataConsumerObserverEvents = {
    close: [];
    pause: [];
    resume: [];
};
type DataConsumerDump = DataConsumerData & {
    id: string;
    paused: boolean;
    dataProducerPaused: boolean;
    subchannels: number[];
};
type DataConsumerInternal = TransportInternal & {
    dataConsumerId: string;
};
type DataConsumerData = {
    dataProducerId: string;
    type: DataConsumerType;
    sctpStreamParameters?: SctpStreamParameters;
    label: string;
    protocol: string;
    bufferedAmountLowThreshold: number;
};
export declare class DataConsumer<DataConsumerAppData extends AppData = AppData> extends EnhancedEventEmitter<DataConsumerEvents> {
    #private;
    /**
     * @private
     */
    constructor({ internal, data, channel, paused, dataProducerPaused, subchannels, appData }: {
        internal: DataConsumerInternal;
        data: DataConsumerData;
        channel: Channel;
        paused: boolean;
        dataProducerPaused: boolean;
        subchannels: number[];
        appData?: DataConsumerAppData;
    });
    /**
     * DataConsumer id.
     */
    get id(): string;
    /**
     * Associated DataProducer id.
     */
    get dataProducerId(): string;
    /**
     * Whether the DataConsumer is closed.
     */
    get closed(): boolean;
    /**
     * DataConsumer type.
     */
    get type(): DataConsumerType;
    /**
     * SCTP stream parameters.
     */
    get sctpStreamParameters(): SctpStreamParameters | undefined;
    /**
     * DataChannel label.
     */
    get label(): string;
    /**
     * DataChannel protocol.
     */
    get protocol(): string;
    /**
     * Whether the DataConsumer is paused.
     */
    get paused(): boolean;
    /**
     * Whether the associate DataProducer is paused.
     */
    get dataProducerPaused(): boolean;
    /**
     * Get current subchannels this data consumer is subscribed to.
     */
    get subchannels(): number[];
    /**
     * App custom data.
     */
    get appData(): DataConsumerAppData;
    /**
     * App custom data setter.
     */
    set appData(appData: DataConsumerAppData);
    /**
     * Observer.
     */
    get observer(): EnhancedEventEmitter<DataConsumerObserverEvents>;
    /**
     * Close the DataConsumer.
     */
    close(): void;
    /**
     * Transport was closed.
     *
     * @private
     */
    transportClosed(): void;
    /**
     * Dump DataConsumer.
     */
    dump(): Promise<DataConsumerDump>;
    /**
     * Get DataConsumer stats.
     */
    getStats(): Promise<DataConsumerStat[]>;
    /**
     * Pause the DataConsumer.
     */
    pause(): Promise<void>;
    /**
     * Resume the DataConsumer.
     */
    resume(): Promise<void>;
    /**
     * Set buffered amount low threshold.
     */
    setBufferedAmountLowThreshold(threshold: number): Promise<void>;
    /**
     * Send data.
     */
    send(message: string | Buffer, ppid?: number): Promise<void>;
    /**
     * Get buffered amount size.
     */
    getBufferedAmount(): Promise<number>;
    /**
     * Set subchannels.
     */
    setSubchannels(subchannels: number[]): Promise<void>;
    private handleWorkerNotifications;
}
export declare function dataConsumerTypeToFbs(type: DataConsumerType): FbsDataProducer.Type;
export declare function dataConsumerTypeFromFbs(type: FbsDataProducer.Type): DataConsumerType;
export declare function parseDataConsumerDumpResponse(data: FbsDataConsumer.DumpResponse): DataConsumerDump;
export {};
//# sourceMappingURL=DataConsumer.d.ts.map