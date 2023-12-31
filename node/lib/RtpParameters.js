"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRtpParameters = exports.parseRtpEncodingParameters = exports.parseRtpHeaderExtensionParameters = exports.rtpHeaderExtensionUriToFbs = exports.rtpHeaderExtensionUriFromFbs = exports.parseRtpCodecParameters = exports.parseParameters = exports.parseRtcpFeedback = exports.serializeParameters = exports.serializeRtpEncodingParameters = exports.serializeRtpParameters = void 0;
const rtp_parameters_1 = require("./fbs/rtp-parameters");
const utils = require("./utils");
function serializeRtpParameters(builder, rtpParameters) {
    const codecs = [];
    const headerExtensions = [];
    for (const codec of rtpParameters.codecs) {
        const mimeTypeOffset = builder.createString(codec.mimeType);
        const parameters = serializeParameters(builder, codec.parameters);
        const parametersOffset = rtp_parameters_1.RtpCodecParameters.createParametersVector(builder, parameters);
        const rtcpFeedback = [];
        for (const rtcp of codec.rtcpFeedback ?? []) {
            const typeOffset = builder.createString(rtcp.type);
            const rtcpParametersOffset = builder.createString(rtcp.parameter);
            rtcpFeedback.push(rtp_parameters_1.RtcpFeedback.createRtcpFeedback(builder, typeOffset, rtcpParametersOffset));
        }
        const rtcpFeedbackOffset = rtp_parameters_1.RtpCodecParameters.createRtcpFeedbackVector(builder, rtcpFeedback);
        codecs.push(rtp_parameters_1.RtpCodecParameters.createRtpCodecParameters(builder, mimeTypeOffset, codec.payloadType, codec.clockRate, Number(codec.channels), parametersOffset, rtcpFeedbackOffset));
    }
    const codecsOffset = rtp_parameters_1.RtpParameters.createCodecsVector(builder, codecs);
    // RtpHeaderExtensionParameters.
    for (const headerExtension of rtpParameters.headerExtensions ?? []) {
        const uri = rtpHeaderExtensionUriToFbs(headerExtension.uri);
        const parameters = serializeParameters(builder, headerExtension.parameters);
        const parametersOffset = rtp_parameters_1.RtpCodecParameters.createParametersVector(builder, parameters);
        headerExtensions.push(rtp_parameters_1.RtpHeaderExtensionParameters.createRtpHeaderExtensionParameters(builder, uri, headerExtension.id, Boolean(headerExtension.encrypt), parametersOffset));
    }
    const headerExtensionsOffset = rtp_parameters_1.RtpParameters.createHeaderExtensionsVector(builder, headerExtensions);
    // RtpEncodingParameters.
    const encodingsOffset = serializeRtpEncodingParameters(builder, rtpParameters.encodings ?? []);
    // RtcpParameters.
    const { cname, reducedSize } = rtpParameters.rtcp ?? { reducedSize: true };
    const cnameOffset = builder.createString(cname);
    const rtcpOffset = rtp_parameters_1.RtcpParameters.createRtcpParameters(builder, cnameOffset, Boolean(reducedSize));
    const midOffset = builder.createString(rtpParameters.mid);
    rtp_parameters_1.RtpParameters.startRtpParameters(builder);
    rtp_parameters_1.RtpParameters.addMid(builder, midOffset);
    rtp_parameters_1.RtpParameters.addCodecs(builder, codecsOffset);
    rtp_parameters_1.RtpParameters.addHeaderExtensions(builder, headerExtensionsOffset);
    rtp_parameters_1.RtpParameters.addEncodings(builder, encodingsOffset);
    rtp_parameters_1.RtpParameters.addRtcp(builder, rtcpOffset);
    return rtp_parameters_1.RtpParameters.endRtpParameters(builder);
}
exports.serializeRtpParameters = serializeRtpParameters;
function serializeRtpEncodingParameters(builder, rtpEncodingParameters = []) {
    const encodings = [];
    for (const encoding of rtpEncodingParameters) {
        // Prepare Rid.
        const ridOffset = builder.createString(encoding.rid);
        // Prepare Rtx.
        let rtxOffset;
        if (encoding.rtx) {
            rtxOffset = rtp_parameters_1.Rtx.createRtx(builder, encoding.rtx.ssrc);
        }
        // Prepare scalability mode.
        let scalabilityModeOffset;
        if (encoding.scalabilityMode) {
            scalabilityModeOffset = builder.createString(encoding.scalabilityMode);
        }
        // Start serialization.
        rtp_parameters_1.RtpEncodingParameters.startRtpEncodingParameters(builder);
        // Add SSRC.
        if (encoding.ssrc) {
            rtp_parameters_1.RtpEncodingParameters.addSsrc(builder, encoding.ssrc);
        }
        // Add Rid.
        rtp_parameters_1.RtpEncodingParameters.addRid(builder, ridOffset);
        // Add payload type.
        if (encoding.codecPayloadType) {
            rtp_parameters_1.RtpEncodingParameters.addCodecPayloadType(builder, encoding.codecPayloadType);
        }
        // Add RTX.
        if (rtxOffset) {
            rtp_parameters_1.RtpEncodingParameters.addRtx(builder, rtxOffset);
        }
        // Add DTX.
        if (encoding.dtx !== undefined) {
            rtp_parameters_1.RtpEncodingParameters.addDtx(builder, encoding.dtx);
        }
        // Add scalability ode.
        if (scalabilityModeOffset) {
            rtp_parameters_1.RtpEncodingParameters.addScalabilityMode(builder, scalabilityModeOffset);
        }
        // Add max bitrate.
        if (encoding.maxBitrate !== undefined) {
            rtp_parameters_1.RtpEncodingParameters.addMaxBitrate(builder, encoding.maxBitrate);
        }
        // End serialization.
        encodings.push(rtp_parameters_1.RtpEncodingParameters.endRtpEncodingParameters(builder));
    }
    return rtp_parameters_1.RtpParameters.createEncodingsVector(builder, encodings);
}
exports.serializeRtpEncodingParameters = serializeRtpEncodingParameters;
function serializeParameters(builder, parameters) {
    const fbsParameters = [];
    for (const key of Object.keys(parameters)) {
        const value = parameters[key];
        const keyOffset = builder.createString(key);
        let parameterOffset;
        if (typeof value === 'boolean') {
            parameterOffset = rtp_parameters_1.Parameter.createParameter(builder, keyOffset, rtp_parameters_1.Value.Boolean, value === true ? 1 : 0);
        }
        else if (typeof value === 'number') {
            // Integer.
            if (value % 1 === 0) {
                const valueOffset = rtp_parameters_1.Integer32.createInteger32(builder, value);
                parameterOffset = rtp_parameters_1.Parameter.createParameter(builder, keyOffset, rtp_parameters_1.Value.Integer32, valueOffset);
            }
            // Float.
            else {
                const valueOffset = rtp_parameters_1.Double.createDouble(builder, value);
                parameterOffset = rtp_parameters_1.Parameter.createParameter(builder, keyOffset, rtp_parameters_1.Value.Double, valueOffset);
            }
        }
        else if (typeof value === 'string') {
            const valueOffset = rtp_parameters_1.String.createString(builder, builder.createString(value));
            parameterOffset = rtp_parameters_1.Parameter.createParameter(builder, keyOffset, rtp_parameters_1.Value.String, valueOffset);
        }
        else if (Array.isArray(value)) {
            const valueOffset = rtp_parameters_1.Integer32Array.createValueVector(builder, value);
            parameterOffset = rtp_parameters_1.Parameter.createParameter(builder, keyOffset, rtp_parameters_1.Value.Integer32Array, valueOffset);
        }
        else {
            throw new Error(`invalid parameter type [key:'${key}', value:${value}]`);
        }
        fbsParameters.push(parameterOffset);
    }
    return fbsParameters;
}
exports.serializeParameters = serializeParameters;
function parseRtcpFeedback(data) {
    return {
        type: data.type(),
        parameter: data.parameter() ?? undefined
    };
}
exports.parseRtcpFeedback = parseRtcpFeedback;
function parseParameters(data) {
    const parameters = {};
    for (let i = 0; i < data.parametersLength(); i++) {
        const fbsParameter = data.parameters(i);
        switch (fbsParameter.valueType()) {
            case rtp_parameters_1.Value.Boolean:
                {
                    const value = new rtp_parameters_1.Boolean();
                    fbsParameter.value(value);
                    parameters[String(fbsParameter.name())] = value.value();
                    break;
                }
            case rtp_parameters_1.Value.Integer32:
                {
                    const value = new rtp_parameters_1.Integer32();
                    fbsParameter.value(value);
                    parameters[String(fbsParameter.name())] = value.value();
                    break;
                }
            case rtp_parameters_1.Value.Double:
                {
                    const value = new rtp_parameters_1.Double();
                    fbsParameter.value(value);
                    parameters[String(fbsParameter.name())] = value.value();
                    break;
                }
            case rtp_parameters_1.Value.String:
                {
                    const value = new rtp_parameters_1.String();
                    fbsParameter.value(value);
                    parameters[String(fbsParameter.name())] = value.value();
                    break;
                }
            case rtp_parameters_1.Value.Integer32Array:
                {
                    const value = new rtp_parameters_1.Integer32Array();
                    fbsParameter.value(value);
                    parameters[String(fbsParameter.name())] = value.valueArray();
                    break;
                }
        }
    }
    return parameters;
}
exports.parseParameters = parseParameters;
function parseRtpCodecParameters(data) {
    const parameters = parseParameters(data);
    let rtcpFeedback = [];
    if (data.rtcpFeedbackLength() > 0) {
        rtcpFeedback = utils.parseVector(data, 'rtcpFeedback', parseRtcpFeedback);
    }
    return {
        mimeType: data.mimeType(),
        payloadType: data.payloadType(),
        clockRate: data.clockRate(),
        channels: data.channels() ?? undefined,
        parameters,
        rtcpFeedback
    };
}
exports.parseRtpCodecParameters = parseRtpCodecParameters;
function rtpHeaderExtensionUriFromFbs(uri) {
    switch (uri) {
        case rtp_parameters_1.RtpHeaderExtensionUri.Mid:
            return 'urn:ietf:params:rtp-hdrext:sdes:mid';
        case rtp_parameters_1.RtpHeaderExtensionUri.RtpStreamId:
            return 'urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id';
        case rtp_parameters_1.RtpHeaderExtensionUri.RepairRtpStreamId:
            return 'urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id';
        case rtp_parameters_1.RtpHeaderExtensionUri.FrameMarkingDraft07:
            return 'http://tools.ietf.org/html/draft-ietf-avtext-framemarking-07';
        case rtp_parameters_1.RtpHeaderExtensionUri.FrameMarking:
            return 'urn:ietf:params:rtp-hdrext:framemarking';
        case rtp_parameters_1.RtpHeaderExtensionUri.AudioLevel:
            return 'urn:ietf:params:rtp-hdrext:ssrc-audio-level';
        case rtp_parameters_1.RtpHeaderExtensionUri.VideoOrientation:
            return 'urn:3gpp:video-orientation';
        case rtp_parameters_1.RtpHeaderExtensionUri.TimeOffset:
            return 'urn:ietf:params:rtp-hdrext:toffset';
        case rtp_parameters_1.RtpHeaderExtensionUri.TransportWideCcDraft01:
            return 'http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01';
        case rtp_parameters_1.RtpHeaderExtensionUri.AbsSendTime:
            return 'http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time';
        case rtp_parameters_1.RtpHeaderExtensionUri.AbsCaptureTime:
            return 'http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time';
    }
}
exports.rtpHeaderExtensionUriFromFbs = rtpHeaderExtensionUriFromFbs;
function rtpHeaderExtensionUriToFbs(uri) {
    switch (uri) {
        case 'urn:ietf:params:rtp-hdrext:sdes:mid':
            return rtp_parameters_1.RtpHeaderExtensionUri.Mid;
        case 'urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id':
            return rtp_parameters_1.RtpHeaderExtensionUri.RtpStreamId;
        case 'urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id':
            return rtp_parameters_1.RtpHeaderExtensionUri.RepairRtpStreamId;
        case 'http://tools.ietf.org/html/draft-ietf-avtext-framemarking-07':
            return rtp_parameters_1.RtpHeaderExtensionUri.FrameMarkingDraft07;
        case 'urn:ietf:params:rtp-hdrext:framemarking':
            return rtp_parameters_1.RtpHeaderExtensionUri.FrameMarking;
        case 'urn:ietf:params:rtp-hdrext:ssrc-audio-level':
            return rtp_parameters_1.RtpHeaderExtensionUri.AudioLevel;
        case 'urn:3gpp:video-orientation':
            return rtp_parameters_1.RtpHeaderExtensionUri.VideoOrientation;
        case 'urn:ietf:params:rtp-hdrext:toffset':
            return rtp_parameters_1.RtpHeaderExtensionUri.TimeOffset;
        case 'http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01':
            return rtp_parameters_1.RtpHeaderExtensionUri.TransportWideCcDraft01;
        case 'http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time':
            return rtp_parameters_1.RtpHeaderExtensionUri.AbsSendTime;
        case 'http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time':
            return rtp_parameters_1.RtpHeaderExtensionUri.AbsCaptureTime;
        default:
            throw new TypeError(`invalid RtpHeaderExtensionUri: ${uri}`);
    }
}
exports.rtpHeaderExtensionUriToFbs = rtpHeaderExtensionUriToFbs;
function parseRtpHeaderExtensionParameters(data) {
    return {
        uri: rtpHeaderExtensionUriFromFbs(data.uri()),
        id: data.id(),
        encrypt: data.encrypt(),
        parameters: parseParameters(data)
    };
}
exports.parseRtpHeaderExtensionParameters = parseRtpHeaderExtensionParameters;
function parseRtpEncodingParameters(data) {
    return {
        ssrc: data.ssrc() ?? undefined,
        rid: data.rid() ?? undefined,
        codecPayloadType: data.codecPayloadType() !== null ?
            data.codecPayloadType() :
            undefined,
        rtx: data.rtx() ?
            { ssrc: data.rtx().ssrc() } :
            undefined,
        dtx: data.dtx(),
        scalabilityMode: data.scalabilityMode() ?? undefined,
        maxBitrate: data.maxBitrate() !== null ? data.maxBitrate() : undefined
    };
}
exports.parseRtpEncodingParameters = parseRtpEncodingParameters;
function parseRtpParameters(data) {
    const codecs = utils.parseVector(data, 'codecs', parseRtpCodecParameters);
    let headerExtensions = [];
    if (data.headerExtensionsLength() > 0) {
        headerExtensions = utils.parseVector(data, 'headerExtensions', parseRtpHeaderExtensionParameters);
    }
    let encodings = [];
    if (data.encodingsLength() > 0) {
        encodings = utils.parseVector(data, 'encodings', parseRtpEncodingParameters);
    }
    let rtcp;
    if (data.rtcp()) {
        const fbsRtcp = data.rtcp();
        rtcp = {
            cname: fbsRtcp.cname() ?? undefined,
            reducedSize: fbsRtcp.reducedSize()
        };
    }
    return {
        mid: data.mid() ?? undefined,
        codecs,
        headerExtensions,
        encodings,
        rtcp
    };
}
exports.parseRtpParameters = parseRtpParameters;
