"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAdjustmentTotal = calculateAdjustmentTotal;
const common_1 = require("../../common");
const big_number_1 = require("../big-number");
const math_1 = require("../math");
function calculateAdjustmentTotal({ adjustments, includesTax, taxRate, }) {
    // the sum of all adjustment amounts excluding tax
    let adjustmentsSubtotal = math_1.MathBN.convert(0);
    // the sum of all adjustment amounts including tax
    let adjustmentsTotal = math_1.MathBN.convert(0);
    // the sum of all taxes on subtotals
    let adjustmentsTaxTotal = math_1.MathBN.convert(0);
    for (const adj of adjustments) {
        if (!(0, common_1.isDefined)(adj.amount)) {
            continue;
        }
        const adjustmentAmount = math_1.MathBN.convert(adj.amount);
        adjustmentsSubtotal = math_1.MathBN.add(adjustmentsSubtotal, adjustmentAmount);
        if ((0, common_1.isDefined)(taxRate)) {
            const adjustmentSubtotal = includesTax
                ? math_1.MathBN.div(adjustmentAmount, math_1.MathBN.add(1, taxRate))
                : adjustmentAmount;
            const adjustmentTaxTotal = math_1.MathBN.mult(adjustmentSubtotal, taxRate);
            const adjustmentTotal = math_1.MathBN.add(adjustmentSubtotal, adjustmentTaxTotal);
            adj["subtotal"] = new big_number_1.BigNumber(adjustmentSubtotal);
            adj["total"] = new big_number_1.BigNumber(adjustmentTotal);
            adjustmentsTotal = math_1.MathBN.add(adjustmentsTotal, adjustmentTotal);
            adjustmentsTaxTotal = math_1.MathBN.add(adjustmentsTaxTotal, adjustmentTaxTotal);
        }
        else {
            adj["subtotal"] = new big_number_1.BigNumber(adjustmentAmount);
            adj["adjustmentAmount"] = new big_number_1.BigNumber(adjustmentAmount);
            adjustmentsTotal = math_1.MathBN.add(adjustmentsTotal, adjustmentAmount);
        }
    }
    return {
        adjustmentsTotal,
        adjustmentsSubtotal,
        adjustmentsTaxTotal,
    };
}
//# sourceMappingURL=index.js.map