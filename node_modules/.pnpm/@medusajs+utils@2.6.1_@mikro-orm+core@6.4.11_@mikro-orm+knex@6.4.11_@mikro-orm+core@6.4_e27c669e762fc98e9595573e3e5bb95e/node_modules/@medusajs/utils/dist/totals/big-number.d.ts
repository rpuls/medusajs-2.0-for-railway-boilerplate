import { BigNumberInput, BigNumberRawValue, IBigNumber } from "@medusajs/types";
import { BigNumber as BigNumberJS } from "bignumber.js";
export declare class BigNumber implements IBigNumber {
    static DEFAULT_PRECISION: number;
    private numeric_;
    private raw_?;
    private bignumber_?;
    constructor(rawValue: BigNumberInput | BigNumber, options?: {
        precision?: number;
    });
    setRawValueOrThrow(rawValue: BigNumberInput | BigNumber, { precision }?: {
        precision?: number;
    }): void;
    get numeric(): number;
    set numeric(value: BigNumberInput);
    get raw(): BigNumberRawValue | undefined;
    get bigNumber(): BigNumberJS | undefined;
    set raw(rawValue: BigNumberInput);
    toJSON(): number;
    valueOf(): number;
    [Symbol.toPrimitive](hint: any): string | number | undefined;
}
//# sourceMappingURL=big-number.d.ts.map