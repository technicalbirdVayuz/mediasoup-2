"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.DumpResponseT = exports.DumpResponse = void 0;
const flatbuffers = require("flatbuffers");
const channel_message_handlers_1 = require("../../fbs/worker/channel-message-handlers");
class DumpResponse {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsDumpResponse(bb, obj) {
        return (obj || new DumpResponse()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsDumpResponse(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new DumpResponse()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    pid() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    webRtcServerIds(index, optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
    }
    webRtcServerIdsLength() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    routerIds(index, optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
    }
    routerIdsLength() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    channelMessageHandlers(obj) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? (obj || new channel_message_handlers_1.ChannelMessageHandlers()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    static startDumpResponse(builder) {
        builder.startObject(4);
    }
    static addPid(builder, pid) {
        builder.addFieldInt32(0, pid, 0);
    }
    static addWebRtcServerIds(builder, webRtcServerIdsOffset) {
        builder.addFieldOffset(1, webRtcServerIdsOffset, 0);
    }
    static createWebRtcServerIdsVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startWebRtcServerIdsVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addRouterIds(builder, routerIdsOffset) {
        builder.addFieldOffset(2, routerIdsOffset, 0);
    }
    static createRouterIdsVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startRouterIdsVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addChannelMessageHandlers(builder, channelMessageHandlersOffset) {
        builder.addFieldOffset(3, channelMessageHandlersOffset, 0);
    }
    static endDumpResponse(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 6); // web_rtc_server_ids
        builder.requiredField(offset, 8); // router_ids
        builder.requiredField(offset, 10); // channel_message_handlers
        return offset;
    }
    unpack() {
        return new DumpResponseT(this.pid(), this.bb.createScalarList(this.webRtcServerIds.bind(this), this.webRtcServerIdsLength()), this.bb.createScalarList(this.routerIds.bind(this), this.routerIdsLength()), (this.channelMessageHandlers() !== null ? this.channelMessageHandlers().unpack() : null));
    }
    unpackTo(_o) {
        _o.pid = this.pid();
        _o.webRtcServerIds = this.bb.createScalarList(this.webRtcServerIds.bind(this), this.webRtcServerIdsLength());
        _o.routerIds = this.bb.createScalarList(this.routerIds.bind(this), this.routerIdsLength());
        _o.channelMessageHandlers = (this.channelMessageHandlers() !== null ? this.channelMessageHandlers().unpack() : null);
    }
}
exports.DumpResponse = DumpResponse;
class DumpResponseT {
    pid;
    webRtcServerIds;
    routerIds;
    channelMessageHandlers;
    constructor(pid = 0, webRtcServerIds = [], routerIds = [], channelMessageHandlers = null) {
        this.pid = pid;
        this.webRtcServerIds = webRtcServerIds;
        this.routerIds = routerIds;
        this.channelMessageHandlers = channelMessageHandlers;
    }
    pack(builder) {
        const webRtcServerIds = DumpResponse.createWebRtcServerIdsVector(builder, builder.createObjectOffsetList(this.webRtcServerIds));
        const routerIds = DumpResponse.createRouterIdsVector(builder, builder.createObjectOffsetList(this.routerIds));
        const channelMessageHandlers = (this.channelMessageHandlers !== null ? this.channelMessageHandlers.pack(builder) : 0);
        DumpResponse.startDumpResponse(builder);
        DumpResponse.addPid(builder, this.pid);
        DumpResponse.addWebRtcServerIds(builder, webRtcServerIds);
        DumpResponse.addRouterIds(builder, routerIds);
        DumpResponse.addChannelMessageHandlers(builder, channelMessageHandlers);
        return DumpResponse.endDumpResponse(builder);
    }
}
exports.DumpResponseT = DumpResponseT;
