"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
var Event;
(function (Event) {
    Event[Event["TRANSPORT_SEND_RTCP"] = 0] = "TRANSPORT_SEND_RTCP";
    Event[Event["PRODUCER_SEND"] = 1] = "PRODUCER_SEND";
    Event[Event["DATAPRODUCER_SEND"] = 2] = "DATAPRODUCER_SEND";
    Event[Event["WORKER_RUNNING"] = 3] = "WORKER_RUNNING";
    Event[Event["TRANSPORT_SCTP_STATE_CHANGE"] = 4] = "TRANSPORT_SCTP_STATE_CHANGE";
    Event[Event["TRANSPORT_TRACE"] = 5] = "TRANSPORT_TRACE";
    Event[Event["WEBRTCTRANSPORT_ICE_SELECTED_TUPLE_CHANGE"] = 6] = "WEBRTCTRANSPORT_ICE_SELECTED_TUPLE_CHANGE";
    Event[Event["WEBRTCTRANSPORT_ICE_STATE_CHANGE"] = 7] = "WEBRTCTRANSPORT_ICE_STATE_CHANGE";
    Event[Event["WEBRTCTRANSPORT_DTLS_STATE_CHANGE"] = 8] = "WEBRTCTRANSPORT_DTLS_STATE_CHANGE";
    Event[Event["PLAINTRANSPORT_TUPLE"] = 9] = "PLAINTRANSPORT_TUPLE";
    Event[Event["PLAINTRANSPORT_RTCP_TUPLE"] = 10] = "PLAINTRANSPORT_RTCP_TUPLE";
    Event[Event["DIRECTTRANSPORT_RTCP"] = 11] = "DIRECTTRANSPORT_RTCP";
    Event[Event["PRODUCER_SCORE"] = 12] = "PRODUCER_SCORE";
    Event[Event["PRODUCER_TRACE"] = 13] = "PRODUCER_TRACE";
    Event[Event["PRODUCER_VIDEO_ORIENTATION_CHANGE"] = 14] = "PRODUCER_VIDEO_ORIENTATION_CHANGE";
    Event[Event["CONSUMER_PRODUCER_PAUSE"] = 15] = "CONSUMER_PRODUCER_PAUSE";
    Event[Event["CONSUMER_PRODUCER_RESUME"] = 16] = "CONSUMER_PRODUCER_RESUME";
    Event[Event["CONSUMER_PRODUCER_CLOSE"] = 17] = "CONSUMER_PRODUCER_CLOSE";
    Event[Event["CONSUMER_LAYERS_CHANGE"] = 18] = "CONSUMER_LAYERS_CHANGE";
    Event[Event["CONSUMER_RTP"] = 19] = "CONSUMER_RTP";
    Event[Event["CONSUMER_SCORE"] = 20] = "CONSUMER_SCORE";
    Event[Event["CONSUMER_TRACE"] = 21] = "CONSUMER_TRACE";
    Event[Event["DATACONSUMER_BUFFERED_AMOUNT_LOW"] = 22] = "DATACONSUMER_BUFFERED_AMOUNT_LOW";
    Event[Event["DATACONSUMER_SCTP_SENDBUFFER_FULL"] = 23] = "DATACONSUMER_SCTP_SENDBUFFER_FULL";
    Event[Event["DATACONSUMER_DATAPRODUCER_PAUSE"] = 24] = "DATACONSUMER_DATAPRODUCER_PAUSE";
    Event[Event["DATACONSUMER_DATAPRODUCER_RESUME"] = 25] = "DATACONSUMER_DATAPRODUCER_RESUME";
    Event[Event["DATACONSUMER_DATAPRODUCER_CLOSE"] = 26] = "DATACONSUMER_DATAPRODUCER_CLOSE";
    Event[Event["DATACONSUMER_MESSAGE"] = 27] = "DATACONSUMER_MESSAGE";
    Event[Event["ACTIVESPEAKEROBSERVER_DOMINANT_SPEAKER"] = 28] = "ACTIVESPEAKEROBSERVER_DOMINANT_SPEAKER";
    Event[Event["AUDIOLEVELOBSERVER_SILENCE"] = 29] = "AUDIOLEVELOBSERVER_SILENCE";
    Event[Event["AUDIOLEVELOBSERVER_VOLUMES"] = 30] = "AUDIOLEVELOBSERVER_VOLUMES";
})(Event || (exports.Event = Event = {}));
