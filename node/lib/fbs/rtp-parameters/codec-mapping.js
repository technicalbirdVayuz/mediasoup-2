"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodecMappingT = exports.CodecMapping = void 0;
const flatbuffers = require("flatbuffers");
class CodecMapping {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsCodecMapping(bb, obj) {
        return (obj || new CodecMapping()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsCodecMapping(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new CodecMapping()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    payloadType() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint8(this.bb_pos + offset) : 0;
    }
    mappedPayloadType() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readUint8(this.bb_pos + offset) : 0;
    }
    static startCodecMapping(builder) {
        builder.startObject(2);
    }
    static addPayloadType(builder, payloadType) {
        builder.addFieldInt8(0, payloadType, 0);
    }
    static addMappedPayloadType(builder, mappedPayloadType) {
        builder.addFieldInt8(1, mappedPayloadType, 0);
    }
    static endCodecMapping(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createCodecMapping(builder, payloadType, mappedPayloadType) {
        CodecMapping.startCodecMapping(builder);
        CodecMapping.addPayloadType(builder, payloadType);
        CodecMapping.addMappedPayloadType(builder, mappedPayloadType);
        return CodecMapping.endCodecMapping(builder);
    }
    unpack() {
        return new CodecMappingT(this.payloadType(), this.mappedPayloadType());
    }
    unpackTo(_o) {
        _o.payloadType = this.payloadType();
        _o.mappedPayloadType = this.mappedPayloadType();
    }
}
exports.CodecMapping = CodecMapping;
class CodecMappingT {
    payloadType;
    mappedPayloadType;
    constructor(payloadType = 0, mappedPayloadType = 0) {
        this.payloadType = payloadType;
        this.mappedPayloadType = mappedPayloadType;
    }
    pack(builder) {
        return CodecMapping.createCodecMapping(builder, this.payloadType, this.mappedPayloadType);
    }
}
exports.CodecMappingT = CodecMappingT;
