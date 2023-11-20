"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetMinOutgoingBitrateRequestT = exports.SetMinOutgoingBitrateRequest = void 0;
const flatbuffers = require("flatbuffers");
class SetMinOutgoingBitrateRequest {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsSetMinOutgoingBitrateRequest(bb, obj) {
        return (obj || new SetMinOutgoingBitrateRequest()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsSetMinOutgoingBitrateRequest(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new SetMinOutgoingBitrateRequest()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    minOutgoingBitrate() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    static startSetMinOutgoingBitrateRequest(builder) {
        builder.startObject(1);
    }
    static addMinOutgoingBitrate(builder, minOutgoingBitrate) {
        builder.addFieldInt32(0, minOutgoingBitrate, 0);
    }
    static endSetMinOutgoingBitrateRequest(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createSetMinOutgoingBitrateRequest(builder, minOutgoingBitrate) {
        SetMinOutgoingBitrateRequest.startSetMinOutgoingBitrateRequest(builder);
        SetMinOutgoingBitrateRequest.addMinOutgoingBitrate(builder, minOutgoingBitrate);
        return SetMinOutgoingBitrateRequest.endSetMinOutgoingBitrateRequest(builder);
    }
    unpack() {
        return new SetMinOutgoingBitrateRequestT(this.minOutgoingBitrate());
    }
    unpackTo(_o) {
        _o.minOutgoingBitrate = this.minOutgoingBitrate();
    }
}
exports.SetMinOutgoingBitrateRequest = SetMinOutgoingBitrateRequest;
class SetMinOutgoingBitrateRequestT {
    minOutgoingBitrate;
    constructor(minOutgoingBitrate = 0) {
        this.minOutgoingBitrate = minOutgoingBitrate;
    }
    pack(builder) {
        return SetMinOutgoingBitrateRequest.createSetMinOutgoingBitrateRequest(builder, this.minOutgoingBitrate);
    }
}
exports.SetMinOutgoingBitrateRequestT = SetMinOutgoingBitrateRequestT;