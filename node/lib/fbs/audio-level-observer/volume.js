"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeT = exports.Volume = void 0;
const flatbuffers = require("flatbuffers");
class Volume {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsVolume(bb, obj) {
        return (obj || new Volume()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsVolume(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new Volume()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    producerId(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    volume() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : 0;
    }
    static startVolume(builder) {
        builder.startObject(2);
    }
    static addProducerId(builder, producerIdOffset) {
        builder.addFieldOffset(0, producerIdOffset, 0);
    }
    static addVolume(builder, volume) {
        builder.addFieldInt8(1, volume, 0);
    }
    static endVolume(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 4); // producer_id
        return offset;
    }
    static createVolume(builder, producerIdOffset, volume) {
        Volume.startVolume(builder);
        Volume.addProducerId(builder, producerIdOffset);
        Volume.addVolume(builder, volume);
        return Volume.endVolume(builder);
    }
    unpack() {
        return new VolumeT(this.producerId(), this.volume());
    }
    unpackTo(_o) {
        _o.producerId = this.producerId();
        _o.volume = this.volume();
    }
}
exports.Volume = Volume;
class VolumeT {
    producerId;
    volume;
    constructor(producerId = null, volume = 0) {
        this.producerId = producerId;
        this.volume = volume;
    }
    pack(builder) {
        const producerId = (this.producerId !== null ? builder.createString(this.producerId) : 0);
        return Volume.createVolume(builder, producerId, this.volume);
    }
}
exports.VolumeT = VolumeT;
