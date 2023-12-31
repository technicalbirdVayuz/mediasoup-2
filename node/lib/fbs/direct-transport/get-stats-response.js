"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStatsResponseT = exports.GetStatsResponse = void 0;
const flatbuffers = require("flatbuffers");
const stats_1 = require("../../fbs/transport/stats");
class GetStatsResponse {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsGetStatsResponse(bb, obj) {
        return (obj || new GetStatsResponse()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsGetStatsResponse(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new GetStatsResponse()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    base(obj) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? (obj || new stats_1.Stats()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    static startGetStatsResponse(builder) {
        builder.startObject(1);
    }
    static addBase(builder, baseOffset) {
        builder.addFieldOffset(0, baseOffset, 0);
    }
    static endGetStatsResponse(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 4); // base
        return offset;
    }
    static createGetStatsResponse(builder, baseOffset) {
        GetStatsResponse.startGetStatsResponse(builder);
        GetStatsResponse.addBase(builder, baseOffset);
        return GetStatsResponse.endGetStatsResponse(builder);
    }
    unpack() {
        return new GetStatsResponseT((this.base() !== null ? this.base().unpack() : null));
    }
    unpackTo(_o) {
        _o.base = (this.base() !== null ? this.base().unpack() : null);
    }
}
exports.GetStatsResponse = GetStatsResponse;
class GetStatsResponseT {
    base;
    constructor(base = null) {
        this.base = base;
    }
    pack(builder) {
        const base = (this.base !== null ? this.base.pack(builder) : 0);
        return GetStatsResponse.createGetStatsResponse(builder, base);
    }
}
exports.GetStatsResponseT = GetStatsResponseT;
