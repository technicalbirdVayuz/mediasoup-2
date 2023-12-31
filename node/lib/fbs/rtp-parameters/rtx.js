"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtxT = exports.Rtx = void 0;
const flatbuffers = require("flatbuffers");
class Rtx {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsRtx(bb, obj) {
        return (obj || new Rtx()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsRtx(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new Rtx()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    ssrc() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    static startRtx(builder) {
        builder.startObject(1);
    }
    static addSsrc(builder, ssrc) {
        builder.addFieldInt32(0, ssrc, 0);
    }
    static endRtx(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createRtx(builder, ssrc) {
        Rtx.startRtx(builder);
        Rtx.addSsrc(builder, ssrc);
        return Rtx.endRtx(builder);
    }
    unpack() {
        return new RtxT(this.ssrc());
    }
    unpackTo(_o) {
        _o.ssrc = this.ssrc();
    }
}
exports.Rtx = Rtx;
class RtxT {
    ssrc;
    constructor(ssrc = 0) {
        this.ssrc = ssrc;
    }
    pack(builder) {
        return Rtx.createRtx(builder, this.ssrc);
    }
}
exports.RtxT = RtxT;
