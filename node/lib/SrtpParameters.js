"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeSrtpParameters = exports.parseSrtpParameters = exports.cryptoSuiteToFbs = exports.cryptoSuiteFromFbs = void 0;
const FbsSrtpParameters = require("./fbs/srtp-parameters");
function cryptoSuiteFromFbs(binary) {
    switch (binary) {
        case FbsSrtpParameters.SrtpCryptoSuite.AEAD_AES_256_GCM:
            return 'AEAD_AES_256_GCM';
        case FbsSrtpParameters.SrtpCryptoSuite.AEAD_AES_128_GCM:
            return 'AEAD_AES_128_GCM';
        case FbsSrtpParameters.SrtpCryptoSuite.AES_CM_128_HMAC_SHA1_80:
            return 'AES_CM_128_HMAC_SHA1_80';
        case FbsSrtpParameters.SrtpCryptoSuite.AES_CM_128_HMAC_SHA1_32:
            return 'AES_CM_128_HMAC_SHA1_32';
    }
}
exports.cryptoSuiteFromFbs = cryptoSuiteFromFbs;
function cryptoSuiteToFbs(cryptoSuite) {
    switch (cryptoSuite) {
        case 'AEAD_AES_256_GCM':
            return FbsSrtpParameters.SrtpCryptoSuite.AEAD_AES_256_GCM;
        case 'AEAD_AES_128_GCM':
            return FbsSrtpParameters.SrtpCryptoSuite.AEAD_AES_128_GCM;
        case 'AES_CM_128_HMAC_SHA1_80':
            return FbsSrtpParameters.SrtpCryptoSuite.AES_CM_128_HMAC_SHA1_80;
        case 'AES_CM_128_HMAC_SHA1_32':
            return FbsSrtpParameters.SrtpCryptoSuite.AES_CM_128_HMAC_SHA1_32;
        default:
            throw new TypeError(`invalid SrtpCryptoSuite: ${cryptoSuite}`);
    }
}
exports.cryptoSuiteToFbs = cryptoSuiteToFbs;
function parseSrtpParameters(binary) {
    return {
        cryptoSuite: cryptoSuiteFromFbs(binary.cryptoSuite()),
        keyBase64: binary.keyBase64()
    };
}
exports.parseSrtpParameters = parseSrtpParameters;
function serializeSrtpParameters(builder, srtpParameters) {
    const keyBase64Offset = builder.createString(srtpParameters.keyBase64);
    return FbsSrtpParameters.SrtpParameters.createSrtpParameters(builder, cryptoSuiteToFbs(srtpParameters.cryptoSuite), keyBase64Offset);
}
exports.serializeSrtpParameters = serializeSrtpParameters;
