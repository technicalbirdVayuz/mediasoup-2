"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncodingMappingT = exports.EncodingMapping = void 0;
const flatbuffers = require("flatbuffers");
class EncodingMapping {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsEncodingMapping(bb, obj) {
        return (obj || new EncodingMapping()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsEncodingMapping(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new EncodingMapping()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    rid(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    ssrc() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : null;
    }
    scalabilityMode(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    mappedSsrc() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    static startEncodingMapping(builder) {
        builder.startObject(4);
    }
    static addRid(builder, ridOffset) {
        builder.addFieldOffset(0, ridOffset, 0);
    }
    static addSsrc(builder, ssrc) {
        builder.addFieldInt32(1, ssrc, 0);
    }
    static addScalabilityMode(builder, scalabilityModeOffset) {
        builder.addFieldOffset(2, scalabilityModeOffset, 0);
    }
    static addMappedSsrc(builder, mappedSsrc) {
        builder.addFieldInt32(3, mappedSsrc, 0);
    }
    static endEncodingMapping(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createEncodingMapping(builder, ridOffset, ssrc, scalabilityModeOffset, mappedSsrc) {
        EncodingMapping.startEncodingMapping(builder);
        EncodingMapping.addRid(builder, ridOffset);
        if (ssrc !== null)
            EncodingMapping.addSsrc(builder, ssrc);
        EncodingMapping.addScalabilityMode(builder, scalabilityModeOffset);
        EncodingMapping.addMappedSsrc(builder, mappedSsrc);
        return EncodingMapping.endEncodingMapping(builder);
    }
    unpack() {
        return new EncodingMappingT(this.rid(), this.ssrc(), this.scalabilityMode(), this.mappedSsrc());
    }
    unpackTo(_o) {
        _o.rid = this.rid();
        _o.ssrc = this.ssrc();
        _o.scalabilityMode = this.scalabilityMode();
        _o.mappedSsrc = this.mappedSsrc();
    }
}
exports.EncodingMapping = EncodingMapping;
class EncodingMappingT {
    rid;
    ssrc;
    scalabilityMode;
    mappedSsrc;
    constructor(rid = null, ssrc = null, scalabilityMode = null, mappedSsrc = 0) {
        this.rid = rid;
        this.ssrc = ssrc;
        this.scalabilityMode = scalabilityMode;
        this.mappedSsrc = mappedSsrc;
    }
    pack(builder) {
        const rid = (this.rid !== null ? builder.createString(this.rid) : 0);
        const scalabilityMode = (this.scalabilityMode !== null ? builder.createString(this.scalabilityMode) : 0);
        return EncodingMapping.createEncodingMapping(builder, rid, this.ssrc, scalabilityMode, this.mappedSsrc);
    }
}
exports.EncodingMappingT = EncodingMappingT;
