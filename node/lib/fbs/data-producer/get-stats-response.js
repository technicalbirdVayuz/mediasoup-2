"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStatsResponseT = exports.GetStatsResponse = void 0;
const flatbuffers = require("flatbuffers");
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
    timestamp() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint64(this.bb_pos + offset) : BigInt('0');
    }
    label(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    protocol(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    messagesReceived() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readUint64(this.bb_pos + offset) : BigInt('0');
    }
    bytesReceived() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readUint64(this.bb_pos + offset) : BigInt('0');
    }
    bufferedAmount() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    static startGetStatsResponse(builder) {
        builder.startObject(6);
    }
    static addTimestamp(builder, timestamp) {
        builder.addFieldInt64(0, timestamp, BigInt('0'));
    }
    static addLabel(builder, labelOffset) {
        builder.addFieldOffset(1, labelOffset, 0);
    }
    static addProtocol(builder, protocolOffset) {
        builder.addFieldOffset(2, protocolOffset, 0);
    }
    static addMessagesReceived(builder, messagesReceived) {
        builder.addFieldInt64(3, messagesReceived, BigInt('0'));
    }
    static addBytesReceived(builder, bytesReceived) {
        builder.addFieldInt64(4, bytesReceived, BigInt('0'));
    }
    static addBufferedAmount(builder, bufferedAmount) {
        builder.addFieldInt32(5, bufferedAmount, 0);
    }
    static endGetStatsResponse(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 6); // label
        builder.requiredField(offset, 8); // protocol
        return offset;
    }
    static createGetStatsResponse(builder, timestamp, labelOffset, protocolOffset, messagesReceived, bytesReceived, bufferedAmount) {
        GetStatsResponse.startGetStatsResponse(builder);
        GetStatsResponse.addTimestamp(builder, timestamp);
        GetStatsResponse.addLabel(builder, labelOffset);
        GetStatsResponse.addProtocol(builder, protocolOffset);
        GetStatsResponse.addMessagesReceived(builder, messagesReceived);
        GetStatsResponse.addBytesReceived(builder, bytesReceived);
        GetStatsResponse.addBufferedAmount(builder, bufferedAmount);
        return GetStatsResponse.endGetStatsResponse(builder);
    }
    unpack() {
        return new GetStatsResponseT(this.timestamp(), this.label(), this.protocol(), this.messagesReceived(), this.bytesReceived(), this.bufferedAmount());
    }
    unpackTo(_o) {
        _o.timestamp = this.timestamp();
        _o.label = this.label();
        _o.protocol = this.protocol();
        _o.messagesReceived = this.messagesReceived();
        _o.bytesReceived = this.bytesReceived();
        _o.bufferedAmount = this.bufferedAmount();
    }
}
exports.GetStatsResponse = GetStatsResponse;
class GetStatsResponseT {
    timestamp;
    label;
    protocol;
    messagesReceived;
    bytesReceived;
    bufferedAmount;
    constructor(timestamp = BigInt('0'), label = null, protocol = null, messagesReceived = BigInt('0'), bytesReceived = BigInt('0'), bufferedAmount = 0) {
        this.timestamp = timestamp;
        this.label = label;
        this.protocol = protocol;
        this.messagesReceived = messagesReceived;
        this.bytesReceived = bytesReceived;
        this.bufferedAmount = bufferedAmount;
    }
    pack(builder) {
        const label = (this.label !== null ? builder.createString(this.label) : 0);
        const protocol = (this.protocol !== null ? builder.createString(this.protocol) : 0);
        return GetStatsResponse.createGetStatsResponse(builder, this.timestamp, label, protocol, this.messagesReceived, this.bytesReceived, this.bufferedAmount);
    }
}
exports.GetStatsResponseT = GetStatsResponseT;
