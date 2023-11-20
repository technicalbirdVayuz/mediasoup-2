"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.TupleHashT = exports.TupleHash = void 0;
const flatbuffers = require("flatbuffers");
class TupleHash {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsTupleHash(bb, obj) {
        return (obj || new TupleHash()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsTupleHash(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new TupleHash()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    tupleHash() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint64(this.bb_pos + offset) : BigInt('0');
    }
    webRtcTransportId(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    static startTupleHash(builder) {
        builder.startObject(2);
    }
    static addTupleHash(builder, tupleHash) {
        builder.addFieldInt64(0, tupleHash, BigInt('0'));
    }
    static addWebRtcTransportId(builder, webRtcTransportIdOffset) {
        builder.addFieldOffset(1, webRtcTransportIdOffset, 0);
    }
    static endTupleHash(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 6); // web_rtc_transport_id
        return offset;
    }
    static createTupleHash(builder, tupleHash, webRtcTransportIdOffset) {
        TupleHash.startTupleHash(builder);
        TupleHash.addTupleHash(builder, tupleHash);
        TupleHash.addWebRtcTransportId(builder, webRtcTransportIdOffset);
        return TupleHash.endTupleHash(builder);
    }
    unpack() {
        return new TupleHashT(this.tupleHash(), this.webRtcTransportId());
    }
    unpackTo(_o) {
        _o.tupleHash = this.tupleHash();
        _o.webRtcTransportId = this.webRtcTransportId();
    }
}
exports.TupleHash = TupleHash;
class TupleHashT {
    tupleHash;
    webRtcTransportId;
    constructor(tupleHash = BigInt('0'), webRtcTransportId = null) {
        this.tupleHash = tupleHash;
        this.webRtcTransportId = webRtcTransportId;
    }
    pack(builder) {
        const webRtcTransportId = (this.webRtcTransportId !== null ? builder.createString(this.webRtcTransportId) : 0);
        return TupleHash.createTupleHash(builder, this.tupleHash, webRtcTransportId);
    }
}
exports.TupleHashT = TupleHashT;
