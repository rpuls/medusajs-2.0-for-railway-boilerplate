"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShippingMethodsTotals = getShippingMethodsTotals;
exports.getShippingMethodTotals = getShippingMethodTotals;
const adjustment_1 = require("../adjustment");
const big_number_1 = require("../big-number");
const math_1 = require("../math");
const tax_1 = require("../tax");
function getShippingMethodsTotals(shippingMethods, context) {
    const shippingMethodsTotals = {};
    let index = 0;
    for (const shippingMethod of shippingMethods) {
        shippingMethodsTotals[shippingMethod.id ?? index] = getShippingMethodTotals(shippingMethod, context);
        index++;
    }
    return shippingMethodsTotals;
}
function getShippingMethodTotals(shippingMethod, context) {
    const isTaxInclusive = shippingMethod.is_tax_inclusive ?? context.includeTax;
    const shippingMethodAmount = math_1.MathBN.convert(shippingMethod.amount);
    const sumTax = math_1.MathBN.sum(...(shippingMethod.tax_lines?.map((taxLine) => taxLine.rate) ?? []));
    const sumTaxRate = math_1.MathBN.div(sumTax, 100);
    const subtotal = isTaxInclusive
        ? math_1.MathBN.div(shippingMethodAmount, math_1.MathBN.add(1, sumTaxRate))
        : shippingMethodAmount;
    const { adjustmentsTotal: discountsTotal, adjustmentsSubtotal: discountsSubtotal, adjustmentsTaxTotal: discountsTaxTotal, } = (0, adjustment_1.calculateAdjustmentTotal)({
        adjustments: shippingMethod.adjustments || [],
        includesTax: isTaxInclusive,
        taxRate: sumTaxRate,
    });
    const taxLines = shippingMethod.tax_lines || [];
    const taxTotal = (0, tax_1.calculateTaxTotal)({
        taxLines,
        taxableAmount: math_1.MathBN.sub(subtotal, discountsSubtotal),
        setTotalField: "total",
    });
    const originalTaxTotal = (0, tax_1.calculateTaxTotal)({
        taxLines,
        taxableAmount: subtotal,
        setTotalField: "subtotal",
    });
    const totals = {
        amount: new big_number_1.BigNumber(shippingMethodAmount),
        subtotal: new big_number_1.BigNumber(subtotal),
        total: new big_number_1.BigNumber(math_1.MathBN.sum(math_1.MathBN.sub(subtotal, discountsSubtotal), taxTotal)),
        original_total: new big_number_1.BigNumber(isTaxInclusive
            ? shippingMethodAmount
            : math_1.MathBN.add(subtotal, originalTaxTotal)),
        discount_total: new big_number_1.BigNumber(discountsTotal),
        discount_subtotal: new big_number_1.BigNumber(discountsSubtotal),
        discount_tax_total: new big_number_1.BigNumber(discountsTaxTotal),
        tax_total: new big_number_1.BigNumber(taxTotal),
        original_tax_total: new big_number_1.BigNumber(originalTaxTotal),
    };
    return totals;
}
//# sourceMappingURL=index.js.map