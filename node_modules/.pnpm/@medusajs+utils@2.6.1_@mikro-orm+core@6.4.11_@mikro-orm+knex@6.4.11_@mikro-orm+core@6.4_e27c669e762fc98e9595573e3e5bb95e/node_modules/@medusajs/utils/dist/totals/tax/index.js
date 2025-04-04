"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTaxTotal = calculateTaxTotal;
exports.calculateAmountsWithTax = calculateAmountsWithTax;
const big_number_1 = require("../big-number");
const math_1 = require("../math");
function calculateTaxTotal({ taxLines, taxableAmount, setTotalField, }) {
    if (math_1.MathBN.lte(taxableAmount, 0)) {
        return math_1.MathBN.convert(0);
    }
    let taxTotal = math_1.MathBN.convert(0);
    for (const taxLine of taxLines) {
        const rate = math_1.MathBN.div(taxLine.rate, 100);
        let taxAmount = math_1.MathBN.mult(taxableAmount, rate);
        if (setTotalField) {
            ;
            taxLine[setTotalField] = new big_number_1.BigNumber(taxAmount);
        }
        taxTotal = math_1.MathBN.add(taxTotal, taxAmount);
    }
    return taxTotal;
}
function calculateAmountsWithTax({ taxLines, amount, includesTax, }) {
    const sumTaxRate = math_1.MathBN.div(math_1.MathBN.sum(...((taxLines ?? []).map((taxLine) => taxLine.rate) ?? [])), 100);
    const taxableAmount = includesTax
        ? math_1.MathBN.div(amount, math_1.MathBN.add(1, sumTaxRate))
        : amount;
    const tax = calculateTaxTotal({
        taxLines,
        taxableAmount,
    });
    return {
        priceWithTax: includesTax ? amount : math_1.MathBN.add(tax, amount).toNumber(),
        priceWithoutTax: includesTax ? math_1.MathBN.sub(amount, tax).toNumber() : amount,
    };
}
//# sourceMappingURL=index.js.map