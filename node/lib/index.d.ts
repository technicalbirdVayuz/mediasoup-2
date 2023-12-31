import { EnhancedEventEmitter } from './EnhancedEventEmitter';
import { workerBin, Worker, WorkerSettings } from './Worker';
import { RtpCapabilities } from './RtpParameters';
import * as types from './types';
/**
 * Expose all types.
 */
export { types };
/**
 * Expose mediasoup version.
 */
export declare const version: string;
/**
 * Expose parseScalabilityMode() function.
 */
export { parse as parseScalabilityMode } from './scalabilityModes';
export type ObserverEvents = {
    newworker: [Worker];
};
declare const observer: EnhancedEventEmitter<ObserverEvents>;
/**
 * Observer.
 */
export { observer };
/**
 * Full path of the mediasoup-worker binary.
 */
export { workerBin };
/**
 * Create a Worker.
 */
export declare function createWorker<WorkerAppData extends types.AppData = types.AppData>({ logLevel, logTags, rtcMinPort, rtcMaxPort, dtlsCertificateFile, dtlsPrivateKeyFile, libwebrtcFieldTrials, appData }?: WorkerSettings<WorkerAppData>): Promise<Worker<WorkerAppData>>;
/**
 * Get a cloned copy of the mediasoup supported RTP capabilities.
 */
export declare function getSupportedRtpCapabilities(): RtpCapabilities;
//# sourceMappingURL=index.d.ts.map