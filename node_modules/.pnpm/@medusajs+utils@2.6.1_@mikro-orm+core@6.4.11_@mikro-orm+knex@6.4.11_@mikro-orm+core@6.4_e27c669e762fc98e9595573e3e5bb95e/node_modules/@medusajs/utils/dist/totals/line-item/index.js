"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLineItemsTotals = getLineItemsTotals;
const common_1 = require("../../common");
const adjustment_1 = require("../adjustment");
const big_number_1 = require("../big-number");
const math_1 = require("../math");
const tax_1 = require("../tax");
function getLineItemsTotals(items, context) {
    const itemsTotals = {};
    let index = 0;
    for (const item of items) {
        itemsTotals[item.id ?? index] = getLineItemTotals(item, {
            includeTax: context.includeTax || item.is_tax_inclusive,
            extraQuantityFields: context.extraQuantityFields,
        });
        index++;
    }
    return itemsTotals;
}
function setRefundableTotal(item, discountsTotal, totals, context) {
    const itemDetail = item.detail;
    const totalReturnedQuantity = math_1.MathBN.sum(itemDetail.return_requested_quantity ?? 0, itemDetail.return_received_quantity ?? 0, itemDetail.return_dismissed_quantity ?? 0);
    const currentQuantity = math_1.MathBN.sub(item.quantity, totalReturnedQuantity);
    const discountPerUnit = math_1.MathBN.div(discountsTotal, item.quantity);
    const refundableSubTotal = math_1.MathBN.sub(math_1.MathBN.mult(currentQuantity, item.unit_price), math_1.MathBN.mult(currentQuantity, discountPerUnit));
    const taxTotal = (0, tax_1.calculateTaxTotal)({
        taxLines: item.tax_lines || [],
        taxableAmount: refundableSubTotal,
    });
    const refundableTotal = math_1.MathBN.add(refundableSubTotal, taxTotal);
    totals.refundable_total_per_unit = new big_number_1.BigNumber(math_1.MathBN.eq(currentQuantity, 0)
        ? 0
        : math_1.MathBN.div(refundableTotal, currentQuantity));
    totals.refundable_total = new big_number_1.BigNumber(refundableTotal);
}
function getLineItemTotals(item, context) {
    const isTaxInclusive = item.is_tax_inclusive ?? context.includeTax;
    const sumTax = math_1.MathBN.sum(...((item.tax_lines ?? []).map((taxLine) => taxLine.rate) ?? []));
    const sumTaxRate = math_1.MathBN.div(sumTax, 100);
    const totalItemPrice = math_1.MathBN.mult(item.unit_price, item.quantity);
    /*
      If the price is inclusive of tax, we need to remove the taxed amount from the subtotal
      Original Price = Total Price / (1 + Tax Rate)
    */
    const subtotal = isTaxInclusive
        ? math_1.MathBN.div(totalItemPrice, math_1.MathBN.add(1, sumTaxRate))
        : totalItemPrice;
    const { adjustmentsTotal: discountsTotal, adjustmentsSubtotal: discountsSubtotal, adjustmentsTaxTotal: discountTaxTotal, } = (0, adjustment_1.calculateAdjustmentTotal)({
        adjustments: item.adjustments || [],
        includesTax: isTaxInclusive,
        taxRate: sumTaxRate,
    });
    const taxTotal = (0, tax_1.calculateTaxTotal)({
        taxLines: item.tax_lines || [],
        taxableAmount: math_1.MathBN.sub(subtotal, discountsSubtotal),
        setTotalField: "total",
    });
    const originalTaxTotal = (0, tax_1.calculateTaxTotal)({
        taxLines: item.tax_lines || [],
        taxableAmount: subtotal,
        setTotalField: "subtotal",
    });
    const totals = {
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: new big_number_1.BigNumber(subtotal),
        total: new big_number_1.BigNumber(math_1.MathBN.sum(math_1.MathBN.sub(subtotal, discountsSubtotal), taxTotal)),
        original_total: new big_number_1.BigNumber(isTaxInclusive ? totalItemPrice : math_1.MathBN.add(subtotal, originalTaxTotal)),
        discount_total: new big_number_1.BigNumber(discountsTotal),
        discount_subtotal: new big_number_1.BigNumber(discountsSubtotal),
        discount_tax_total: new big_number_1.BigNumber(discountTaxTotal),
        tax_total: new big_number_1.BigNumber(taxTotal),
        original_tax_total: new big_number_1.BigNumber(originalTaxTotal),
    };
    if ((0, common_1.isDefined)(item.detail?.return_requested_quantity)) {
        setRefundableTotal(item, discountsTotal, totals, context);
    }
    const div = math_1.MathBN.eq(item.quantity, 0) ? 1 : item.quantity;
    const totalPerUnit = math_1.MathBN.div(totals.total, div);
    const optionalFields = {
        ...(context.extraQuantityFields ?? {}),
    };
    for (const field in optionalFields) {
        const totalField = optionalFields[field];
        let target = item[totalField];
        if (field.includes(".")) {
            target = (0, common_1.pickValueFromObject)(field, item);
        }
        if (!(0, common_1.isDefined)(target)) {
            continue;
        }
        totals[totalField] = new big_number_1.BigNumber(math_1.MathBN.mult(totalPerUnit, target));
    }
    return totals;
}
//# sourceMappingURL=index.js.map