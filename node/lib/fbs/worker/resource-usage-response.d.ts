import * as flatbuffers from 'flatbuffers';
export declare class ResourceUsageResponse implements flatbuffers.IUnpackableObject<ResourceUsageResponseT> {
    bb: flatbuffers.ByteBuffer | null;
    bb_pos: number;
    __init(i: number, bb: flatbuffers.ByteBuffer): ResourceUsageResponse;
    static getRootAsResourceUsageResponse(bb: flatbuffers.ByteBuffer, obj?: ResourceUsageResponse): ResourceUsageResponse;
    static getSizePrefixedRootAsResourceUsageResponse(bb: flatbuffers.ByteBuffer, obj?: ResourceUsageResponse): ResourceUsageResponse;
    ruUtime(): bigint;
    ruStime(): bigint;
    ruMaxrss(): bigint;
    ruIxrss(): bigint;
    ruIdrss(): bigint;
    ruIsrss(): bigint;
    ruMinflt(): bigint;
    ruMajflt(): bigint;
    ruNswap(): bigint;
    ruInblock(): bigint;
    ruOublock(): bigint;
    ruMsgsnd(): bigint;
    ruMsgrcv(): bigint;
    ruNsignals(): bigint;
    ruNvcsw(): bigint;
    ruNivcsw(): bigint;
    static startResourceUsageResponse(builder: flatbuffers.Builder): void;
    static addRuUtime(builder: flatbuffers.Builder, ruUtime: bigint): void;
    static addRuStime(builder: flatbuffers.Builder, ruStime: bigint): void;
    static addRuMaxrss(builder: flatbuffers.Builder, ruMaxrss: bigint): void;
    static addRuIxrss(builder: flatbuffers.Builder, ruIxrss: bigint): void;
    static addRuIdrss(builder: flatbuffers.Builder, ruIdrss: bigint): void;
    static addRuIsrss(builder: flatbuffers.Builder, ruIsrss: bigint): void;
    static addRuMinflt(builder: flatbuffers.Builder, ruMinflt: bigint): void;
    static addRuMajflt(builder: flatbuffers.Builder, ruMajflt: bigint): void;
    static addRuNswap(builder: flatbuffers.Builder, ruNswap: bigint): void;
    static addRuInblock(builder: flatbuffers.Builder, ruInblock: bigint): void;
    static addRuOublock(builder: flatbuffers.Builder, ruOublock: bigint): void;
    static addRuMsgsnd(builder: flatbuffers.Builder, ruMsgsnd: bigint): void;
    static addRuMsgrcv(builder: flatbuffers.Builder, ruMsgrcv: bigint): void;
    static addRuNsignals(builder: flatbuffers.Builder, ruNsignals: bigint): void;
    static addRuNvcsw(builder: flatbuffers.Builder, ruNvcsw: bigint): void;
    static addRuNivcsw(builder: flatbuffers.Builder, ruNivcsw: bigint): void;
    static endResourceUsageResponse(builder: flatbuffers.Builder): flatbuffers.Offset;
    static createResourceUsageResponse(builder: flatbuffers.Builder, ruUtime: bigint, ruStime: bigint, ruMaxrss: bigint, ruIxrss: bigint, ruIdrss: bigint, ruIsrss: bigint, ruMinflt: bigint, ruMajflt: bigint, ruNswap: bigint, ruInblock: bigint, ruOublock: bigint, ruMsgsnd: bigint, ruMsgrcv: bigint, ruNsignals: bigint, ruNvcsw: bigint, ruNivcsw: bigint): flatbuffers.Offset;
    unpack(): ResourceUsageResponseT;
    unpackTo(_o: ResourceUsageResponseT): void;
}
export declare class ResourceUsageResponseT implements flatbuffers.IGeneratedObject {
    ruUtime: bigint;
    ruStime: bigint;
    ruMaxrss: bigint;
    ruIxrss: bigint;
    ruIdrss: bigint;
    ruIsrss: bigint;
    ruMinflt: bigint;
    ruMajflt: bigint;
    ruNswap: bigint;
    ruInblock: bigint;
    ruOublock: bigint;
    ruMsgsnd: bigint;
    ruMsgrcv: bigint;
    ruNsignals: bigint;
    ruNvcsw: bigint;
    ruNivcsw: bigint;
    constructor(ruUtime?: bigint, ruStime?: bigint, ruMaxrss?: bigint, ruIxrss?: bigint, ruIdrss?: bigint, ruIsrss?: bigint, ruMinflt?: bigint, ruMajflt?: bigint, ruNswap?: bigint, ruInblock?: bigint, ruOublock?: bigint, ruMsgsnd?: bigint, ruMsgrcv?: bigint, ruNsignals?: bigint, ruNvcsw?: bigint, ruNivcsw?: bigint);
    pack(builder: flatbuffers.Builder): flatbuffers.Offset;
}
//# sourceMappingURL=resource-usage-response.d.ts.map