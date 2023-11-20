"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestT = exports.Request = void 0;
const flatbuffers = require("flatbuffers");
const body_1 = require("../../fbs/request/body");
const method_1 = require("../../fbs/request/method");
class Request {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsRequest(bb, obj) {
        return (obj || new Request()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsRequest(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new Request()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    id() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
    }
    method() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readUint8(this.bb_pos + offset) : method_1.Method.WORKER_CLOSE;
    }
    handlerId(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    bodyType() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readUint8(this.bb_pos + offset) : body_1.Body.NONE;
    }
    body(obj) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
    }
    static startRequest(builder) {
        builder.startObject(5);
    }
    static addId(builder, id) {
        builder.addFieldInt32(0, id, 0);
    }
    static addMethod(builder, method) {
        builder.addFieldInt8(1, method, method_1.Method.WORKER_CLOSE);
    }
    static addHandlerId(builder, handlerIdOffset) {
        builder.addFieldOffset(2, handlerIdOffset, 0);
    }
    static addBodyType(builder, bodyType) {
        builder.addFieldInt8(3, bodyType, body_1.Body.NONE);
    }
    static addBody(builder, bodyOffset) {
        builder.addFieldOffset(4, bodyOffset, 0);
    }
    static endRequest(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 8); // handler_id
        return offset;
    }
    static finishRequestBuffer(builder, offset) {
        builder.finish(offset);
    }
    static finishSizePrefixedRequestBuffer(builder, offset) {
        builder.finish(offset, undefined, true);
    }
    static createRequest(builder, id, method, handlerIdOffset, bodyType, bodyOffset) {
        Request.startRequest(builder);
        Request.addId(builder, id);
        Request.addMethod(builder, method);
        Request.addHandlerId(builder, handlerIdOffset);
        Request.addBodyType(builder, bodyType);
        Request.addBody(builder, bodyOffset);
        return Request.endRequest(builder);
    }
    unpack() {
        return new RequestT(this.id(), this.method(), this.handlerId(), this.bodyType(), (() => {
            const temp = (0, body_1.unionToBody)(this.bodyType(), this.body.bind(this));
            if (temp === null) {
                return null;
            }
            return temp.unpack();
        })());
    }
    unpackTo(_o) {
        _o.id = this.id();
        _o.method = this.method();
        _o.handlerId = this.handlerId();
        _o.bodyType = this.bodyType();
        _o.body = (() => {
            const temp = (0, body_1.unionToBody)(this.bodyType(), this.body.bind(this));
            if (temp === null) {
                return null;
            }
            return temp.unpack();
        })();
    }
}
exports.Request = Request;
class RequestT {
    id;
    method;
    handlerId;
    bodyType;
    body;
    constructor(id = 0, method = method_1.Method.WORKER_CLOSE, handlerId = null, bodyType = body_1.Body.NONE, body = null) {
        this.id = id;
        this.method = method;
        this.handlerId = handlerId;
        this.bodyType = bodyType;
        this.body = body;
    }
    pack(builder) {
        const handlerId = (this.handlerId !== null ? builder.createString(this.handlerId) : 0);
        const body = builder.createObjectOffset(this.body);
        return Request.createRequest(builder, this.id, this.method, handlerId, this.bodyType, body);
    }
}
exports.RequestT = RequestT;
