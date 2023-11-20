"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.BweTraceInfoT = exports.BweTraceInfo = void 0;
const flatbuffers = require("flatbuffers");
const bwe_type_1 = require("../../fbs/transport/bwe-type");
class BweTraceInfo {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsBweTraceInfo(bb, obj) {
        return (obj || new BweTraceInfo()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsBweTraceInfo(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new BweTraceInfo()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    bweType() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint8(this.bb_pos + offset) : bwe_type_1.BweType.TRANSPORT_CC;
    }
    desiredBitrate() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    effectiveDesiredBitrate() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    minBitrate() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    maxBitrate() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    startBitrate() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    maxPaddingBitrate() {
        const offset = this.bb.__offset(this.bb_pos, 16);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    availableBitrate() {
        const offset = this.bb.__offset(this.bb_pos, 18);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    static startBweTraceInfo(builder) {
        builder.startObject(8);
    }
    static addBweType(builder, bweType) {
        builder.addFieldInt8(0, bweType, bwe_type_1.BweType.TRANSPORT_CC);
    }
    static addDesiredBitrate(builder, desiredBitrate) {
        builder.addFieldInt32(1, desiredBitrate, 0);
    }
    static addEffectiveDesiredBitrate(builder, effectiveDesiredBitrate) {
        builder.addFieldInt32(2, effectiveDesiredBitrate, 0);
    }
    static addMinBitrate(builder, minBitrate) {
        builder.addFieldInt32(3, minBitrate, 0);
    }
    static addMaxBitrate(builder, maxBitrate) {
        builder.addFieldInt32(4, maxBitrate, 0);
    }
    static addStartBitrate(builder, startBitrate) {
        builder.addFieldInt32(5, startBitrate, 0);
    }
    static addMaxPaddingBitrate(builder, maxPaddingBitrate) {
        builder.addFieldInt32(6, maxPaddingBitrate, 0);
    }
    static addAvailableBitrate(builder, availableBitrate) {
        builder.addFieldInt32(7, availableBitrate, 0);
    }
    static endBweTraceInfo(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createBweTraceInfo(builder, bweType, desiredBitrate, effectiveDesiredBitrate, minBitrate, maxBitrate, startBitrate, maxPaddingBitrate, availableBitrate) {
        BweTraceInfo.startBweTraceInfo(builder);
        BweTraceInfo.addBweType(builder, bweType);
        BweTraceInfo.addDesiredBitrate(builder, desiredBitrate);
        BweTraceInfo.addEffectiveDesiredBitrate(builder, effectiveDesiredBitrate);
        BweTraceInfo.addMinBitrate(builder, minBitrate);
        BweTraceInfo.addMaxBitrate(builder, maxBitrate);
        BweTraceInfo.addStartBitrate(builder, startBitrate);
        BweTraceInfo.addMaxPaddingBitrate(builder, maxPaddingBitrate);
        BweTraceInfo.addAvailableBitrate(builder, availableBitrate);
        return BweTraceInfo.endBweTraceInfo(builder);
    }
    unpack() {
        return new BweTraceInfoT(this.bweType(), this.desiredBitrate(), this.effectiveDesiredBitrate(), this.minBitrate(), this.maxBitrate(), this.startBitrate(), this.maxPaddingBitrate(), this.availableBitrate());
    }
    unpackTo(_o) {
        _o.bweType = this.bweType();
        _o.desiredBitrate = this.desiredBitrate();
        _o.effectiveDesiredBitrate = this.effectiveDesiredBitrate();
        _o.minBitrate = this.minBitrate();
        _o.maxBitrate = this.maxBitrate();
        _o.startBitrate = this.startBitrate();
        _o.maxPaddingBitrate = this.maxPaddingBitrate();
        _o.availableBitrate = this.availableBitrate();
    }
}
exports.BweTraceInfo = BweTraceInfo;
class BweTraceInfoT {
    bweType;
    desiredBitrate;
    effectiveDesiredBitrate;
    minBitrate;
    maxBitrate;
    startBitrate;
    maxPaddingBitrate;
    availableBitrate;
    constructor(bweType = bwe_type_1.BweType.TRANSPORT_CC, desiredBitrate = 0, effectiveDesiredBitrate = 0, minBitrate = 0, maxBitrate = 0, startBitrate = 0, maxPaddingBitrate = 0, availableBitrate = 0) {
        this.bweType = bweType;
        this.desiredBitrate = desiredBitrate;
        this.effectiveDesiredBitrate = effectiveDesiredBitrate;
        this.minBitrate = minBitrate;
        this.maxBitrate = maxBitrate;
        this.startBitrate = startBitrate;
        this.maxPaddingBitrate = maxPaddingBitrate;
        this.availableBitrate = availableBitrate;
    }
    pack(builder) {
        return BweTraceInfo.createBweTraceInfo(builder, this.bweType, this.desiredBitrate, this.effectiveDesiredBitrate, this.minBitrate, this.maxBitrate, this.startBitrate, this.maxPaddingBitrate, this.availableBitrate);
    }
}
exports.BweTraceInfoT = BweTraceInfoT;
