"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWorkerDumpResponse = exports.Worker = exports.workerBin = void 0;
const process = require("node:process");
const path = require("node:path");
const node_child_process_1 = require("node:child_process");
const _1 = require("./");
const Logger_1 = require("./Logger");
const EnhancedEventEmitter_1 = require("./EnhancedEventEmitter");
const ortc = require("./ortc");
const Channel_1 = require("./Channel");
const Router_1 = require("./Router");
const WebRtcServer_1 = require("./WebRtcServer");
const utils_1 = require("./utils");
const notification_1 = require("./fbs/notification");
const FbsRequest = require("./fbs/request");
const FbsWorker = require("./fbs/worker");
const FbsTransport = require("./fbs/transport");
const protocol_1 = require("./fbs/transport/protocol");
// If env MEDIASOUP_WORKER_BIN is given, use it as worker binary.
// Otherwise if env MEDIASOUP_BUILDTYPE is 'Debug' use the Debug binary.
// Otherwise use the Release binary.
exports.workerBin = process.env.MEDIASOUP_WORKER_BIN
    ? process.env.MEDIASOUP_WORKER_BIN
    : process.env.MEDIASOUP_BUILDTYPE === 'Debug'
        ? path.join(__dirname, '..', '..', 'worker', 'out', 'Debug', 'mediasoup-worker')
        : path.join(__dirname, '..', '..', 'worker', 'out', 'Release', 'mediasoup-worker');
const logger = new Logger_1.Logger('Worker');
const workerLogger = new Logger_1.Logger('Worker');
class Worker extends EnhancedEventEmitter_1.EnhancedEventEmitter {
    // mediasoup-worker child process.
    #child;
    // Worker process PID.
    #pid;
    // Channel instance.
    #channel;
    // Closed flag.
    #closed = false;
    // Died dlag.
    #died = false;
    // Custom app data.
    #appData;
    // WebRtcServers set.
    #webRtcServers = new Set();
    // Routers set.
    #routers = new Set();
    // Observer instance.
    #observer = new EnhancedEventEmitter_1.EnhancedEventEmitter();
    /**
     * @private
     */
    constructor({ logLevel, logTags, rtcMinPort, rtcMaxPort, dtlsCertificateFile, dtlsPrivateKeyFile, libwebrtcFieldTrials, appData }) {
        super();
        logger.debug('constructor()');
        let spawnBin = exports.workerBin;
        let spawnArgs = [];
        if (process.env.MEDIASOUP_USE_VALGRIND === 'true') {
            spawnBin = process.env.MEDIASOUP_VALGRIND_BIN || 'valgrind';
            if (process.env.MEDIASOUP_VALGRIND_OPTIONS) {
                spawnArgs = spawnArgs.concat(process.env.MEDIASOUP_VALGRIND_OPTIONS.split(/\s+/));
            }
            spawnArgs.push(exports.workerBin);
        }
        if (typeof logLevel === 'string' && logLevel) {
            spawnArgs.push(`--logLevel=${logLevel}`);
        }
        for (const logTag of (Array.isArray(logTags) ? logTags : [])) {
            if (typeof logTag === 'string' && logTag) {
                spawnArgs.push(`--logTag=${logTag}`);
            }
        }
        if (typeof rtcMinPort === 'number' && !Number.isNaN(rtcMinPort)) {
            spawnArgs.push(`--rtcMinPort=${rtcMinPort}`);
        }
        if (typeof rtcMaxPort === 'number' && !Number.isNaN(rtcMaxPort)) {
            spawnArgs.push(`--rtcMaxPort=${rtcMaxPort}`);
        }
        if (typeof dtlsCertificateFile === 'string' && dtlsCertificateFile) {
            spawnArgs.push(`--dtlsCertificateFile=${dtlsCertificateFile}`);
        }
        if (typeof dtlsPrivateKeyFile === 'string' && dtlsPrivateKeyFile) {
            spawnArgs.push(`--dtlsPrivateKeyFile=${dtlsPrivateKeyFile}`);
        }
        if (typeof libwebrtcFieldTrials === 'string' && libwebrtcFieldTrials) {
            spawnArgs.push(`--libwebrtcFieldTrials=${libwebrtcFieldTrials}`);
        }
        logger.debug('spawning worker process: %s %s', spawnBin, spawnArgs.join(' '));
        this.#child = (0, node_child_process_1.spawn)(
        // command
        spawnBin, 
        // args
        spawnArgs, 
        // options
        {
            env: {
                MEDIASOUP_VERSION: _1.version,
                // Let the worker process inherit all environment variables, useful
                // if a custom and not in the path GCC is used so the user can set
                // LD_LIBRARY_PATH environment variable for runtime.
                ...process.env
            },
            detached: false,
            // fd 0 (stdin)   : Just ignore it.
            // fd 1 (stdout)  : Pipe it for 3rd libraries that log their own stuff.
            // fd 2 (stderr)  : Same as stdout.
            // fd 3 (channel) : Producer Channel fd.
            // fd 4 (channel) : Consumer Channel fd.
            stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe'],
            windowsHide: true
        });
        this.#pid = this.#child.pid;
        this.#channel = new Channel_1.Channel({
            producerSocket: this.#child.stdio[3],
            consumerSocket: this.#child.stdio[4],
            pid: this.#pid
        });
        this.#appData = appData || {};
        let spawnDone = false;
        // Listen for 'running' notification.
        this.#channel.once(String(this.#pid), (event) => {
            if (!spawnDone && event === notification_1.Event.WORKER_RUNNING) {
                spawnDone = true;
                logger.debug('worker process running [pid:%s]', this.#pid);
                this.emit('@success');
            }
        });
        this.#child.on('exit', (code, signal) => {
            this.#child = undefined;
            if (!spawnDone) {
                spawnDone = true;
                if (code === 42) {
                    logger.error('worker process failed due to wrong settings [pid:%s]', this.#pid);
                    this.close();
                    this.emit('@failure', new TypeError('wrong settings'));
                }
                else {
                    logger.error('worker process failed unexpectedly [pid:%s, code:%s, signal:%s]', this.#pid, code, signal);
                    this.close();
                    this.emit('@failure', new Error(`[pid:${this.#pid}, code:${code}, signal:${signal}]`));
                }
            }
            else {
                logger.error('worker process died unexpectedly [pid:%s, code:%s, signal:%s]', this.#pid, code, signal);
                this.workerDied(new Error(`[pid:${this.#pid}, code:${code}, signal:${signal}]`));
            }
        });
        this.#child.on('error', (error) => {
            this.#child = undefined;
            if (!spawnDone) {
                spawnDone = true;
                logger.error('worker process failed [pid:%s]: %s', this.#pid, error.message);
                this.close();
                this.emit('@failure', error);
            }
            else {
                logger.error('worker process error [pid:%s]: %s', this.#pid, error.message);
                this.workerDied(error);
            }
        });
        // Be ready for 3rd party worker libraries logging to stdout.
        this.#child.stdout.on('data', (buffer) => {
            for (const line of buffer.toString('utf8').split('\n')) {
                if (line) {
                    workerLogger.debug(`(stdout) ${line}`);
                }
            }
        });
        // In case of a worker bug, mediasoup will log to stderr.
        this.#child.stderr.on('data', (buffer) => {
            for (const line of buffer.toString('utf8').split('\n')) {
                if (line) {
                    workerLogger.error(`(stderr) ${line}`);
                }
            }
        });
    }
    /**
     * Worker process identifier (PID).
     */
    get pid() {
        return this.#pid;
    }
    /**
     * Whether the Worker is closed.
     */
    get closed() {
        return this.#closed;
    }
    /**
     * Whether the Worker died.
     */
    get died() {
        return this.#died;
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
    get webRtcServersForTesting() {
        return this.#webRtcServers;
    }
    /**
     * @private
     * Just for testing purposes.
     */
    get routersForTesting() {
        return this.#routers;
    }
    /**
     * Close the Worker.
     */
    close() {
        if (this.#closed) {
            return;
        }
        logger.debug('close()');
        this.#closed = true;
        // Kill the worker process.
        if (this.#child) {
            // Remove event listeners but leave a fake 'error' hander to avoid
            // propagation.
            this.#child.removeAllListeners('exit');
            this.#child.removeAllListeners('error');
            this.#child.on('error', () => { });
            this.#child.kill('SIGTERM');
            this.#child = undefined;
        }
        // Close the Channel instance.
        this.#channel.close();
        // Close every Router.
        for (const router of this.#routers) {
            router.workerClosed();
        }
        this.#routers.clear();
        // Close every WebRtcServer.
        for (const webRtcServer of this.#webRtcServers) {
            webRtcServer.workerClosed();
        }
        this.#webRtcServers.clear();
        // Emit observer event.
        this.#observer.safeEmit('close');
    }
    /**
     * Dump Worker.
     */
    async dump() {
        logger.debug('dump()');
        // Send the request and wait for the response.
        const response = await this.#channel.request(FbsRequest.Method.WORKER_DUMP);
        /* Decode Response. */
        const dump = new FbsWorker.DumpResponse();
        response.body(dump);
        return parseWorkerDumpResponse(dump);
    }
    /**
     * Get mediasoup-worker process resource usage.
     */
    async getResourceUsage() {
        logger.debug('getResourceUsage()');
        const response = await this.#channel.request(FbsRequest.Method.WORKER_GET_RESOURCE_USAGE);
        /* Decode Response. */
        const resourceUsage = new FbsWorker.ResourceUsageResponse();
        response.body(resourceUsage);
        const ru = resourceUsage.unpack();
        /* eslint-disable camelcase */
        return {
            ru_utime: Number(ru.ruUtime),
            ru_stime: Number(ru.ruStime),
            ru_maxrss: Number(ru.ruMaxrss),
            ru_ixrss: Number(ru.ruIxrss),
            ru_idrss: Number(ru.ruIdrss),
            ru_isrss: Number(ru.ruIsrss),
            ru_minflt: Number(ru.ruMinflt),
            ru_majflt: Number(ru.ruMajflt),
            ru_nswap: Number(ru.ruNswap),
            ru_inblock: Number(ru.ruInblock),
            ru_oublock: Number(ru.ruOublock),
            ru_msgsnd: Number(ru.ruMsgsnd),
            ru_msgrcv: Number(ru.ruMsgrcv),
            ru_nsignals: Number(ru.ruNsignals),
            ru_nvcsw: Number(ru.ruNvcsw),
            ru_nivcsw: Number(ru.ruNivcsw)
        };
        /* eslint-enable camelcase */
    }
    /**
     * Update settings.
     */
    async updateSettings({ logLevel, logTags } = {}) {
        logger.debug('updateSettings()');
        // Build the request.
        const requestOffset = new FbsWorker.UpdateSettingsRequestT(logLevel, logTags)
            .pack(this.#channel.bufferBuilder);
        await this.#channel.request(FbsRequest.Method.WORKER_UPDATE_SETTINGS, FbsRequest.Body.Worker_UpdateSettingsRequest, requestOffset);
    }
    /**
     * Create a WebRtcServer.
     */
    async createWebRtcServer({ listenInfos, appData }) {
        logger.debug('createWebRtcServer()');
        if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        // Build the request.
        const fbsListenInfos = [];
        for (const listenInfo of listenInfos) {
            fbsListenInfos.push(new FbsTransport.ListenInfoT(listenInfo.protocol === 'udp'
                ? protocol_1.Protocol.UDP
                : protocol_1.Protocol.TCP, listenInfo.ip, listenInfo.announcedIp, listenInfo.port, listenInfo.sendBufferSize, listenInfo.recvBufferSize));
        }
        const webRtcServerId = (0, utils_1.generateUUIDv4)();
        const createWebRtcServerRequestOffset = new FbsWorker.CreateWebRtcServerRequestT(webRtcServerId, fbsListenInfos).pack(this.#channel.bufferBuilder);
        await this.#channel.request(FbsRequest.Method.WORKER_CREATE_WEBRTCSERVER, FbsRequest.Body.Worker_CreateWebRtcServerRequest, createWebRtcServerRequestOffset);
        const webRtcServer = new WebRtcServer_1.WebRtcServer({
            internal: { webRtcServerId },
            channel: this.#channel,
            appData
        });
        this.#webRtcServers.add(webRtcServer);
        webRtcServer.on('@close', () => this.#webRtcServers.delete(webRtcServer));
        // Emit observer event.
        this.#observer.safeEmit('newwebrtcserver', webRtcServer);
        return webRtcServer;
    }
    /**
     * Create a Router.
     */
    async createRouter({ mediaCodecs, appData } = {}) {
        logger.debug('createRouter()');
        if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        // This may throw.
        const rtpCapabilities = ortc.generateRouterRtpCapabilities(mediaCodecs);
        const routerId = (0, utils_1.generateUUIDv4)();
        // Get flatbuffer builder.
        const createRouterRequestOffset = new FbsWorker.CreateRouterRequestT(routerId).pack(this.#channel.bufferBuilder);
        await this.#channel.request(FbsRequest.Method.WORKER_CREATE_ROUTER, FbsRequest.Body.Worker_CreateRouterRequest, createRouterRequestOffset);
        const data = { rtpCapabilities };
        const router = new Router_1.Router({
            internal: {
                routerId
            },
            data,
            channel: this.#channel,
            appData
        });
        this.#routers.add(router);
        router.on('@close', () => this.#routers.delete(router));
        // Emit observer event.
        this.#observer.safeEmit('newrouter', router);
        return router;
    }
    workerDied(error) {
        if (this.#closed) {
            return;
        }
        logger.debug(`died() [error:${error}]`);
        this.#closed = true;
        this.#died = true;
        // Close the Channel instance.
        this.#channel.close();
        // Close every Router.
        for (const router of this.#routers) {
            router.workerClosed();
        }
        this.#routers.clear();
        // Close every WebRtcServer.
        for (const webRtcServer of this.#webRtcServers) {
            webRtcServer.workerClosed();
        }
        this.#webRtcServers.clear();
        this.safeEmit('died', error);
        // Emit observer event.
        this.#observer.safeEmit('close');
    }
}
exports.Worker = Worker;
function parseWorkerDumpResponse(binary) {
    return {
        pid: binary.pid(),
        webRtcServerIds: (0, utils_1.parseVector)(binary, 'webRtcServerIds'),
        routerIds: (0, utils_1.parseVector)(binary, 'routerIds'),
        channelMessageHandlers: {
            channelRequestHandlers: (0, utils_1.parseVector)(binary.channelMessageHandlers(), 'channelRequestHandlers'),
            channelNotificationHandlers: (0, utils_1.parseVector)(binary.channelMessageHandlers(), 'channelNotificationHandlers')
        }
    };
}
exports.parseWorkerDumpResponse = parseWorkerDumpResponse;
