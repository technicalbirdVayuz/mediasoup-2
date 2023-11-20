"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetSubchannelsResponseT = exports.SetSubchannelsResponse = void 0;
const flatbuffers = require("flatbuffers");
class SetSubchannelsResponse {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsSetSubchannelsResponse(bb, obj) {
        return (obj || new SetSubchannelsResponse()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsSetSubchannelsResponse(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new SetSubchannelsResponse()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    subchannels(index) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint16(this.bb.__vector(this.bb_pos + offset) + index * 2) : 0;
    }
    subchannelsLength() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    subchannelsArray() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? new Uint16Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
    }
    static startSetSubchannelsResponse(builder) {
        builder.startObject(1);
    }
    static addSubchannels(builder, subchannelsOffset) {
        builder.addFieldOffset(0, subchannelsOffset, 0);
    }
    static createSubchannelsVector(builder, data) {
        builder.startVector(2, data.length, 2);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addInt16(data[i]);
        }
        return builder.endVector();
    }
    static startSubchannelsVector(builder, numElems) {
        builder.startVector(2, numElems, 2);
    }
    static endSetSubchannelsResponse(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 4); // subchannels
        return offset;
    }
    static createSetSubchannelsResponse(builder, subchannelsOffset) {
        SetSubchannelsResponse.startSetSubchannelsResponse(builder);
        SetSubchannelsResponse.addSubchannels(builder, subchannelsOffset);
        return SetSubchannelsResponse.endSetSubchannelsResponse(builder);
    }
    unpack() {
        return new SetSubchannelsResponseT(this.bb.createScalarList(this.subchannels.bind(this), this.subchannelsLength()));
    }
    unpackTo(_o) {
        _o.subchannels = this.bb.createScalarList(this.subchannels.bind(this), this.subchannelsLength());
    }
}
exports.SetSubchannelsResponse = SetSubchannelsResponse;
class SetSubchannelsResponseT {
    subchannels;
    constructor(subchannels = []) {
        this.subchannels = subchannels;
    }
    pack(builder) {
        const subchannels = SetSubchannelsResponse.createSubchannelsVector(builder, this.subchannels);
        return SetSubchannelsResponse.createSetSubchannelsResponse(builder, subchannels);
    }
}
exports.SetSubchannelsResponseT = SetSubchannelsResponseT;
