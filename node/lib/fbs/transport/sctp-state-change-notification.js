"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.SctpStateChangeNotificationT = exports.SctpStateChangeNotification = void 0;
const flatbuffers = require("flatbuffers");
const sctp_state_1 = require("../../fbs/sctp-association/sctp-state");
class SctpStateChangeNotification {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsSctpStateChangeNotification(bb, obj) {
        return (obj || new SctpStateChangeNotification()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsSctpStateChangeNotification(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new SctpStateChangeNotification()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    sctpState() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint8(this.bb_pos + offset) : sctp_state_1.SctpState.NEW;
    }
    static startSctpStateChangeNotification(builder) {
        builder.startObject(1);
    }
    static addSctpState(builder, sctpState) {
        builder.addFieldInt8(0, sctpState, sctp_state_1.SctpState.NEW);
    }
    static endSctpStateChangeNotification(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static createSctpStateChangeNotification(builder, sctpState) {
        SctpStateChangeNotification.startSctpStateChangeNotification(builder);
        SctpStateChangeNotification.addSctpState(builder, sctpState);
        return SctpStateChangeNotification.endSctpStateChangeNotification(builder);
    }
    unpack() {
        return new SctpStateChangeNotificationT(this.sctpState());
    }
    unpackTo(_o) {
        _o.sctpState = this.sctpState();
    }
}
exports.SctpStateChangeNotification = SctpStateChangeNotification;
class SctpStateChangeNotificationT {
    sctpState;
    constructor(sctpState = sctp_state_1.SctpState.NEW) {
        this.sctpState = sctpState;
    }
    pack(builder) {
        return SctpStateChangeNotification.createSctpStateChangeNotification(builder, this.sctpState);
    }
}
exports.SctpStateChangeNotificationT = SctpStateChangeNotificationT;
