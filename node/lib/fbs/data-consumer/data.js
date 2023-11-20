"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.unionListToData = exports.unionToData = exports.Data = void 0;
const binary_1 = require("../../fbs/data-consumer/binary");
const string_1 = require("../../fbs/data-consumer/string");
var Data;
(function (Data) {
    Data[Data["NONE"] = 0] = "NONE";
    Data[Data["String"] = 1] = "String";
    Data[Data["Binary"] = 2] = "Binary";
})(Data || (exports.Data = Data = {}));
function unionToData(type, accessor) {
    switch (Data[type]) {
        case 'NONE': return null;
        case 'String': return accessor(new string_1.String());
        case 'Binary': return accessor(new binary_1.Binary());
        default: return null;
    }
}
exports.unionToData = unionToData;
function unionListToData(type, accessor, index) {
    switch (Data[type]) {
        case 'NONE': return null;
        case 'String': return accessor(index, new string_1.String());
        case 'Binary': return accessor(index, new binary_1.Binary());
        default: return null;
    }
}
exports.unionListToData = unionListToData;
