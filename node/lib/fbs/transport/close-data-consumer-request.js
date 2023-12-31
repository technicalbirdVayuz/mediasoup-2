"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseDataConsumerRequestT = exports.CloseDataConsumerRequest = void 0;
const flatbuffers = require("flatbuffers");
class CloseDataConsumerRequest {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsCloseDataConsumerRequest(bb, obj) {
        return (obj || new CloseDataConsumerRequest()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsCloseDataConsumerRequest(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new CloseDataConsumerRequest()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    dataConsumerId(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    static startCloseDataConsumerRequest(builder) {
        builder.startObject(1);
    }
    static addDataConsumerId(builder, dataConsumerIdOffset) {
        builder.addFieldOffset(0, dataConsumerIdOffset, 0);
    }
    static endCloseDataConsumerRequest(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 4); // data_consumer_id
        return offset;
    }
    static createCloseDataConsumerRequest(builder, dataConsumerIdOffset) {
        CloseDataConsumerRequest.startCloseDataConsumerRequest(builder);
        CloseDataConsumerRequest.addDataConsumerId(builder, dataConsumerIdOffset);
        return CloseDataConsumerRequest.endCloseDataConsumerRequest(builder);
    }
    unpack() {
        return new CloseDataConsumerRequestT(this.dataConsumerId());
    }
    unpackTo(_o) {
        _o.dataConsumerId = this.dataConsumerId();
    }
}
exports.CloseDataConsumerRequest = CloseDataConsumerRequest;
class CloseDataConsumerRequestT {
    dataConsumerId;
    constructor(dataConsumerId = null) {
        this.dataConsumerId = dataConsumerId;
    }
    pack(builder) {
        const dataConsumerId = (this.dataConsumerId !== null ? builder.createString(this.dataConsumerId) : 0);
        return CloseDataConsumerRequest.createCloseDataConsumerRequest(builder, dataConsumerId);
    }
}
exports.CloseDataConsumerRequestT = CloseDataConsumerRequestT;
