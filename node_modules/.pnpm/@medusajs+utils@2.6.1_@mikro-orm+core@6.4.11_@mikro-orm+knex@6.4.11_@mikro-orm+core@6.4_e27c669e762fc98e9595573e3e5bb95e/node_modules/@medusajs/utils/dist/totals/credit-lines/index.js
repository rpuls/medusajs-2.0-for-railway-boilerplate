"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCreditLinesTotal = calculateCreditLinesTotal;
const common_1 = require("../../common");
const big_number_1 = require("../big-number");
const math_1 = require("../math");
function calculateCreditLinesTotal({ creditLines, includesTax, taxRate, }) {
    // the sum of all creditLine amounts excluding tax
    let creditLinesSubtotal = math_1.MathBN.convert(0);
    // the sum of all creditLine amounts including tax
    let creditLinesTotal = math_1.MathBN.convert(0);
    // the sum of all taxes on subtotals
    let creditLinesTaxTotal = math_1.MathBN.convert(0);
    for (const cl of creditLines) {
        if (!(0, common_1.isDefined)(cl.amount)) {
            continue;
        }
        const creditLineAmount = math_1.MathBN.convert(cl.amount);
        creditLinesSubtotal = math_1.MathBN.add(creditLinesSubtotal, creditLineAmount);
        if ((0, common_1.isDefined)(taxRate)) {
            const creditLineSubtotal = includesTax
                ? math_1.MathBN.div(creditLineAmount, math_1.MathBN.add(1, taxRate))
                : creditLineAmount;
            const creditLineTaxTotal = math_1.MathBN.mult(creditLineSubtotal, taxRate);
            const creditLineTotal = math_1.MathBN.add(creditLineSubtotal, creditLineTaxTotal);
            cl["subtotal"] = new big_number_1.BigNumber(creditLineSubtotal);
            cl["total"] = new big_number_1.BigNumber(creditLineTotal);
            creditLinesTotal = math_1.MathBN.add(creditLinesTotal, creditLineTotal);
            creditLinesTaxTotal = math_1.MathBN.add(creditLinesTaxTotal, creditLineTaxTotal);
        }
        else {
            cl["subtotal"] = new big_number_1.BigNumber(creditLineAmount);
            creditLinesTotal = math_1.MathBN.add(creditLinesTotal, creditLineAmount);
        }
    }
    return {
        creditLinesTotal,
        creditLinesSubtotal,
        creditLinesTaxTotal,
    };
}
//# sourceMappingURL=index.js.map