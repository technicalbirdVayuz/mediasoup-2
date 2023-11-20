"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumeResponseT = exports.ConsumeResponse = void 0;
const flatbuffers = require("flatbuffers");
const consumer_layers_1 = require("../../fbs/consumer/consumer-layers");
const consumer_score_1 = require("../../fbs/consumer/consumer-score");
class ConsumeResponse {
    bb = null;
    bb_pos = 0;
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRootAsConsumeResponse(bb, obj) {
        return (obj || new ConsumeResponse()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRootAsConsumeResponse(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new ConsumeResponse()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    paused() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
    }
    producerPaused() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
    }
    score(obj) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? (obj || new consumer_score_1.ConsumerScore()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    preferredLayers(obj) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? (obj || new consumer_layers_1.ConsumerLayers()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    static startConsumeResponse(builder) {
        builder.startObject(4);
    }
    static addPaused(builder, paused) {
        builder.addFieldInt8(0, +paused, +false);
    }
    static addProducerPaused(builder, producerPaused) {
        builder.addFieldInt8(1, +producerPaused, +false);
    }
    static addScore(builder, scoreOffset) {
        builder.addFieldOffset(2, scoreOffset, 0);
    }
    static addPreferredLayers(builder, preferredLayersOffset) {
        builder.addFieldOffset(3, preferredLayersOffset, 0);
    }
    static endConsumeResponse(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 8); // score
        return offset;
    }
    unpack() {
        return new ConsumeResponseT(this.paused(), this.producerPaused(), (this.score() !== null ? this.score().unpack() : null), (this.preferredLayers() !== null ? this.preferredLayers().unpack() : null));
    }
    unpackTo(_o) {
        _o.paused = this.paused();
        _o.producerPaused = this.producerPaused();
        _o.score = (this.score() !== null ? this.score().unpack() : null);
        _o.preferredLayers = (this.preferredLayers() !== null ? this.preferredLayers().unpack() : null);
    }
}
exports.ConsumeResponse = ConsumeResponse;
class ConsumeResponseT {
    paused;
    producerPaused;
    score;
    preferredLayers;
    constructor(paused = false, producerPaused = false, score = null, preferredLayers = null) {
        this.paused = paused;
        this.producerPaused = producerPaused;
        this.score = score;
        this.preferredLayers = preferredLayers;
    }
    pack(builder) {
        const score = (this.score !== null ? this.score.pack(builder) : 0);
        const preferredLayers = (this.preferredLayers !== null ? this.preferredLayers.pack(builder) : 0);
        ConsumeResponse.startConsumeResponse(builder);
        ConsumeResponse.addPaused(builder, this.paused);
        ConsumeResponse.addProducerPaused(builder, this.producerPaused);
        ConsumeResponse.addScore(builder, score);
        ConsumeResponse.addPreferredLayers(builder, preferredLayers);
        return ConsumeResponse.endConsumeResponse(builder);
    }
}
exports.ConsumeResponseT = ConsumeResponseT;
