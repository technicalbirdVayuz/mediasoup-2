import * as flatbuffers from 'flatbuffers';
import { EnhancedEventEmitter } from './EnhancedEventEmitter';
import { Body as RequestBody, Method } from './fbs/request';
import { Response } from './fbs/response';
import { Body as NotificationBody, Event } from './fbs/notification';
export declare class Channel extends EnhancedEventEmitter {
    #private;
    /**
     * @private
     */
    constructor({ producerSocket, consumerSocket, pid }: {
        producerSocket: any;
        consumerSocket: any;
        pid: number;
    });
    /**
     * flatbuffer builder.
     */
    get bufferBuilder(): flatbuffers.Builder;
    /**
     * @private
     */
    close(): void;
    /**
     * @private
     */
    notify(event: Event, bodyType?: NotificationBody, bodyOffset?: number, handlerId?: string): void;
    request(method: Method, bodyType?: RequestBody, bodyOffset?: number, handlerId?: string): Promise<Response>;
    private processResponse;
    private processNotification;
    private processLog;
}
//# sourceMappingURL=Channel.d.ts.map