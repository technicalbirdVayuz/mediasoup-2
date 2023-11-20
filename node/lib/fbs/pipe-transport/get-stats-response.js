"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStatsResponseT = exports.GetStatsResponse = void 0;
const flatbuffers = require("flatbuffers");
const stats_1 = require("../../fbs/transport/stats");
const tuple_1 = require("../../fbs/transport/tuple");
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
    tuple(obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new tuple_1.Tuple()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    static startGetStatsResponse(builder) {
        builder.startObject(2);
    }
    static addBase(builder, baseOffset) {
        builder.addFieldOffset(0, baseOffset, 0);
    }
    static addTuple(builder, tupleOffset) {
        builder.addFieldOffset(1, tupleOffset, 0);
    }
    static endGetStatsResponse(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 4); // base
        builder.requiredField(offset, 6); // tuple
        return offset;
    }
    unpack() {
        return new GetStatsResponseT((this.base() !== null ? this.base().unpack() : null), (this.tuple() !== null ? this.tuple().unpack() : null));
    }
    unpackTo(_o) {
        _o.base = (this.base() !== null ? this.base().unpack() : null);
        _o.tuple = (this.tuple() !== null ? this.tuple().unpack() : null);
    }
}
exports.GetStatsResponse = GetStatsResponse;
class GetStatsResponseT {
    base;
    tuple;
    constructor(base = null, tuple = null) {
        this.base = base;
        this.tuple = tuple;
    }
    pack(builder) {
        const base = (this.base !== null ? this.base.pack(builder) : 0);
        const tuple = (this.tuple !== null ? this.tuple.pack(builder) : 0);
        GetStatsResponse.startGetStatsResponse(builder);
        GetStatsResponse.addBase(builder, base);
        GetStatsResponse.addTuple(builder, tuple);
        return GetStatsResponse.endGetStatsResponse(builder);
    }
}
exports.GetStatsResponseT = GetStatsResponseT;
