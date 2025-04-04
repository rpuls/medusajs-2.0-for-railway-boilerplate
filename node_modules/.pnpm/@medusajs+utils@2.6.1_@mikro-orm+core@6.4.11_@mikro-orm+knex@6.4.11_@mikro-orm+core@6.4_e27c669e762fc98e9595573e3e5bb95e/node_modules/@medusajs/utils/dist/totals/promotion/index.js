"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPromotionValue = getPromotionValue;
exports.getApplicableQuantity = getApplicableQuantity;
exports.calculateAdjustmentAmountFromPromotion = calculateAdjustmentAmountFromPromotion;
const promotion_1 = require("../../promotion");
const math_1 = require("../math");
function getPromotionValueForPercentage(promotion, lineItemTotal) {
    return math_1.MathBN.mult(math_1.MathBN.div(promotion.value, 100), lineItemTotal);
}
function getPromotionValueForFixed(promotion, lineItemTotal, lineItemsTotal) {
    if (promotion.allocation === promotion_1.ApplicationMethodAllocation.ACROSS) {
        return math_1.MathBN.mult(math_1.MathBN.div(lineItemTotal, lineItemsTotal), promotion.value);
    }
    return promotion.value;
}
function getPromotionValue(promotion, lineItemTotal, lineItemsTotal) {
    if (promotion.type === promotion_1.ApplicationMethodType.PERCENTAGE) {
        return getPromotionValueForPercentage(promotion, lineItemTotal);
    }
    return getPromotionValueForFixed(promotion, lineItemTotal, lineItemsTotal);
}
function getApplicableQuantity(lineItem, maxQuantity) {
    if (maxQuantity && lineItem.quantity) {
        return math_1.MathBN.min(lineItem.quantity, maxQuantity);
    }
    return lineItem.quantity;
}
function getLineItemUnitPrice(lineItem) {
    return math_1.MathBN.div(lineItem.subtotal, lineItem.quantity);
}
function calculateAdjustmentAmountFromPromotion(lineItem, promotion, lineItemsTotal = 0) {
    const quantity = getApplicableQuantity(lineItem, promotion.max_quantity);
    const lineItemTotal = math_1.MathBN.mult(getLineItemUnitPrice(lineItem), quantity);
    const applicableTotal = math_1.MathBN.sub(lineItemTotal, promotion.applied_value);
    if (math_1.MathBN.lte(applicableTotal, 0)) {
        return applicableTotal;
    }
    const promotionValue = getPromotionValue(promotion, applicableTotal, lineItemsTotal);
    return math_1.MathBN.min(promotionValue, applicableTotal);
}
//# sourceMappingURL=index.js.map