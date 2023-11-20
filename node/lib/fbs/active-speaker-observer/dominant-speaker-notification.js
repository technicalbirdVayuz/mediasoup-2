"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.DominantSpeakerNotificationT = exports.DominantSpeakerNotification = void 0;
const flatbuffers = require("flatbuffers");
class DominantSpeakerNotification {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsDominantSpeakerNotification(bb, obj) {
        return (obj || new DominantSpeakerNotification()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsDominantSpeakerNotification(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new DominantSpeakerNotification()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    producerId(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    static startDominantSpeakerNotification(builder) {
        builder.startObject(1);
    }
    static addProducerId(builder, producerIdOffset) {
        builder.addFieldOffset(0, producerIdOffset, 0);
    }
    static endDominantSpeakerNotification(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 4); // producer_id
        return offset;
    }
    static createDominantSpeakerNotification(builder, producerIdOffset) {
        DominantSpeakerNotification.startDominantSpeakerNotification(builder);
        DominantSpeakerNotification.addProducerId(builder, producerIdOffset);
        return DominantSpeakerNotification.endDominantSpeakerNotification(builder);
    }
    unpack() {
        return new DominantSpeakerNotificationT(this.producerId());
    }
    unpackTo(_o) {
        _o.producerId = this.producerId();
    }
}
exports.DominantSpeakerNotification = DominantSpeakerNotification;
class DominantSpeakerNotificationT {
    producerId;
    constructor(producerId = null) {
        this.producerId = producerId;
    }
    pack(builder) {
        const producerId = (this.producerId !== null ? builder.createString(this.producerId) : 0);
        return DominantSpeakerNotification.createDominantSpeakerNotification(builder, producerId);
    }
}
exports.DominantSpeakerNotificationT = DominantSpeakerNotificationT;
