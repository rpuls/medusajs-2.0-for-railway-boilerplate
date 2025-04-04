"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigNumber = void 0;
const bignumber_js_1 = require("bignumber.js");
const common_1 = require("../common");
class BigNumber {
    constructor(rawValue, options) {
        this.setRawValueOrThrow(rawValue, options);
    }
    setRawValueOrThrow(rawValue, { precision } = {}) {
        precision ??= BigNumber.DEFAULT_PRECISION;
        if (rawValue instanceof BigNumber) {
            Object.assign(this, rawValue);
        }
        else if (bignumber_js_1.BigNumber.isBigNumber(rawValue)) {
            /**
             * Example:
             *  const bnUnitValue = new BigNumberJS("10.99")
             *  const unitValue = new BigNumber(bnUnitValue)
             */
            this.numeric_ = rawValue.toNumber();
            this.raw_ = {
                value: rawValue.toPrecision(precision),
                precision,
            };
            this.bignumber_ = rawValue;
        }
        else if ((0, common_1.isString)(rawValue)) {
            /**
             * Example: const unitValue = "1234.1234"
             */
            const bigNum = new bignumber_js_1.BigNumber(rawValue);
            this.numeric_ = bigNum.toNumber();
            this.raw_ = this.raw_ = {
                value: bigNum.toPrecision(precision),
                precision,
            };
            this.bignumber_ = bigNum;
        }
        else if ((0, common_1.isBigNumber)(rawValue)) {
            /**
             * Example: const unitValue = { value: "1234.1234" }
             */
            const definedPrecision = rawValue.precision ?? precision;
            const bigNum = new bignumber_js_1.BigNumber(rawValue.value);
            this.numeric_ = bigNum.toNumber();
            this.raw_ = {
                ...rawValue,
                precision: definedPrecision,
            };
            this.bignumber_ = bigNum;
        }
        else if (typeof rawValue === `number` && !Number.isNaN(rawValue)) {
            /**
             * Example: const unitValue = 1234
             */
            this.numeric_ = rawValue;
            const bigNum = new bignumber_js_1.BigNumber(rawValue);
            this.raw_ = {
                value: bigNum.toPrecision(precision),
                precision,
            };
            this.bignumber_ = bigNum;
        }
        else {
            throw new Error(`Invalid BigNumber value: ${rawValue}. Should be one of: string, number, BigNumber (bignumber.js), BigNumberRawValue`);
        }
    }
    get numeric() {
        let raw = this.raw_;
        if (raw) {
            return new bignumber_js_1.BigNumber(raw.value).toNumber();
        }
        else {
            return this.numeric_;
        }
    }
    set numeric(value) {
        const newValue = new BigNumber(value);
        this.numeric_ = newValue.numeric_;
        this.raw_ = newValue.raw_;
        this.bignumber_ = newValue.bignumber_;
    }
    get raw() {
        return this.raw_;
    }
    get bigNumber() {
        return this.bignumber_;
    }
    set raw(rawValue) {
        const newValue = new BigNumber(rawValue);
        this.numeric_ = newValue.numeric_;
        this.raw_ = newValue.raw_;
        this.bignumber_ = newValue.bignumber_;
    }
    toJSON() {
        return this.bignumber_
            ? this.bignumber_?.toNumber()
            : this.raw_
                ? new bignumber_js_1.BigNumber(this.raw_.value).toNumber()
                : this.numeric_;
    }
    valueOf() {
        return this.numeric_;
    }
    [Symbol.toPrimitive](hint) {
        if (hint === "string") {
            return this.raw?.value;
        }
        return this.numeric_;
    }
}
exports.BigNumber = BigNumber;
BigNumber.DEFAULT_PRECISION = 20;
//# sourceMappingURL=big-number.js.map