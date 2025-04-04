"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathBN = void 0;
const bignumber_js_1 = require("bignumber.js");
const common_1 = require("../common");
const big_number_1 = require("./big-number");
class MathBN {
    static convert(num) {
        if (num == null) {
            return new bignumber_js_1.BigNumber(0);
        }
        if (num instanceof big_number_1.BigNumber) {
            return num.bigNumber;
        }
        else if (num instanceof bignumber_js_1.BigNumber) {
            return num;
        }
        else if ((0, common_1.isDefined)(num?.value)) {
            return new bignumber_js_1.BigNumber(num.value);
        }
        return new bignumber_js_1.BigNumber(num);
    }
    static add(...nums) {
        let sum = new bignumber_js_1.BigNumber(0);
        for (const num of nums) {
            const n = MathBN.convert(num);
            sum = sum.plus(n);
        }
        return sum;
    }
    static sum(...nums) {
        return MathBN.add(0, ...(nums ?? [0]));
    }
    static sub(...nums) {
        let agg = MathBN.convert(nums[0]);
        for (let i = 1; i < nums.length; i++) {
            const n = MathBN.convert(nums[i]);
            agg = agg.minus(n);
        }
        return agg;
    }
    static mult(n1, n2) {
        const num1 = MathBN.convert(n1);
        const num2 = MathBN.convert(n2);
        return num1.times(num2);
    }
    static div(n1, n2) {
        const num1 = MathBN.convert(n1);
        const num2 = MathBN.convert(n2);
        return num1.dividedBy(num2);
    }
    static abs(n) {
        const num = MathBN.convert(n);
        return num.absoluteValue();
    }
    static mod(n1, n2) {
        const num1 = MathBN.convert(n1);
        const num2 = MathBN.convert(n2);
        return num1.modulo(num2);
    }
    static exp(n, exp = 2) {
        const num = MathBN.convert(n);
        const expBy = MathBN.convert(exp);
        return num.exponentiatedBy(expBy);
    }
    static min(...nums) {
        return bignumber_js_1.BigNumber.minimum(...nums.map((num) => MathBN.convert(num)));
    }
    static max(...nums) {
        return bignumber_js_1.BigNumber.maximum(...nums.map((num) => MathBN.convert(num)));
    }
    static gt(n1, n2) {
        const num1 = MathBN.convert(n1);
        const num2 = MathBN.convert(n2);
        return num1.isGreaterThan(num2);
    }
    static gte(n1, n2) {
        const num1 = MathBN.convert(n1);
        const num2 = MathBN.convert(n2);
        return num1.isGreaterThanOrEqualTo(num2);
    }
    static lt(n1, n2) {
        const num1 = MathBN.convert(n1);
        const num2 = MathBN.convert(n2);
        return num1.isLessThan(num2);
    }
    static lte(n1, n2) {
        const num1 = MathBN.convert(n1);
        const num2 = MathBN.convert(n2);
        return num1.isLessThanOrEqualTo(num2);
    }
    static eq(n1, n2) {
        const num1 = MathBN.convert(n1);
        const num2 = MathBN.convert(n2);
        return num1.isEqualTo(num2);
    }
}
exports.MathBN = MathBN;
//# sourceMappingURL=math.js.map