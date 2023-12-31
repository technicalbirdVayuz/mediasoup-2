"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumSctpStreamsT = exports.NumSctpStreams = void 0;
const flatbuffers = require("flatbuffers");
class NumSctpStreams {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsNumSctpStreams(bb, obj) {
        return (obj || new NumSctpStreams()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsNumSctpStreams(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new NumSctpStreams()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    os() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint16(this.bb_pos + offset) : 1024;
    }
    mis() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readUint16(this.bb_pos + offset) : 1024;
    }
    static startNumSctpStreams(builder) {
        builder.startObject(2);
    }
    static addOs(builder, os) {
        builder.addFieldInt16(0, os, 1024);
    }
    static addMis(builder, mis) {
        builder.addFieldInt16(1, mis, 1024);
    }
    static endNumSctpStreams(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createNumSctpStreams(builder, os, mis) {
        NumSctpStreams.startNumSctpStreams(builder);
        NumSctpStreams.addOs(builder, os);
        NumSctpStreams.addMis(builder, mis);
        return NumSctpStreams.endNumSctpStreams(builder);
    }
    unpack() {
        return new NumSctpStreamsT(this.os(), this.mis());
    }
    unpackTo(_o) {
        _o.os = this.os();
        _o.mis = this.mis();
    }
}
exports.NumSctpStreams = NumSctpStreams;
class NumSctpStreamsT {
    os;
    mis;
    constructor(os = 1024, mis = 1024) {
        this.os = os;
        this.mis = mis;
    }
    pack(builder) {
        return NumSctpStreams.createNumSctpStreams(builder, this.os, this.mis);
    }
}
exports.NumSctpStreamsT = NumSctpStreamsT;
