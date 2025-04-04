"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComputedActionsForShippingMethods = getComputedActionsForShippingMethods;
exports.applyPromotionToShippingMethods = applyPromotionToShippingMethods;
const utils_1 = require("@medusajs/framework/utils");
const validations_1 = require("../validations");
const usage_1 = require("./usage");
function getComputedActionsForShippingMethods(promotion, shippingMethodApplicationContext, methodIdPromoValueMap) {
    const applicableShippingItems = [];
    if (!shippingMethodApplicationContext) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `"shipping_methods" should be present as an array in the context for computeActions`);
    }
    for (const shippingMethodContext of shippingMethodApplicationContext) {
        const isPromotionApplicableToItem = (0, validations_1.areRulesValidForContext)(promotion.application_method?.target_rules, shippingMethodContext, utils_1.ApplicationMethodTargetType.SHIPPING_METHODS);
        if (!isPromotionApplicableToItem) {
            continue;
        }
        applicableShippingItems.push(shippingMethodContext);
    }
    return applyPromotionToShippingMethods(promotion, applicableShippingItems, methodIdPromoValueMap);
}
function applyPromotionToShippingMethods(promotion, shippingMethods, methodIdPromoValueMap) {
    const { application_method: applicationMethod } = promotion;
    const allocation = applicationMethod?.allocation;
    const computedActions = [];
    if (allocation === utils_1.ApplicationMethodAllocation.EACH) {
        for (const method of shippingMethods) {
            if (!method.subtotal) {
                continue;
            }
            const appliedPromoValue = methodIdPromoValueMap.get(method.id) ?? 0;
            let promotionValue = utils_1.MathBN.convert(applicationMethod?.value ?? 0);
            const applicableTotal = utils_1.MathBN.sub(method.subtotal, appliedPromoValue);
            if (applicationMethod?.type === utils_1.ApplicationMethodType.PERCENTAGE) {
                promotionValue = utils_1.MathBN.mult(utils_1.MathBN.div(promotionValue, 100), applicableTotal);
            }
            const amount = utils_1.MathBN.min(promotionValue, applicableTotal);
            if (utils_1.MathBN.lte(amount, 0)) {
                continue;
            }
            const budgetExceededAction = (0, usage_1.computeActionForBudgetExceeded)(promotion, amount);
            if (budgetExceededAction) {
                computedActions.push(budgetExceededAction);
                continue;
            }
            methodIdPromoValueMap.set(method.id, utils_1.MathBN.add(appliedPromoValue, amount));
            computedActions.push({
                action: utils_1.ComputedActions.ADD_SHIPPING_METHOD_ADJUSTMENT,
                shipping_method_id: method.id,
                amount,
                code: promotion.code,
            });
        }
    }
    if (allocation === utils_1.ApplicationMethodAllocation.ACROSS) {
        const totalApplicableValue = shippingMethods.reduce((acc, method) => {
            const appliedPromoValue = methodIdPromoValueMap.get(method.id) ?? 0;
            return utils_1.MathBN.add(acc, utils_1.MathBN.sub(method.subtotal ?? 0, appliedPromoValue));
        }, utils_1.MathBN.convert(0));
        if (utils_1.MathBN.lte(totalApplicableValue, 0)) {
            return computedActions;
        }
        for (const method of shippingMethods) {
            if (!method.subtotal) {
                continue;
            }
            const promotionValue = applicationMethod?.value ?? 0;
            const applicableTotal = method.subtotal;
            const appliedPromoValue = methodIdPromoValueMap.get(method.id) ?? 0;
            const div = utils_1.MathBN.eq(totalApplicableValue, 0) ? 1 : totalApplicableValue;
            let applicablePromotionValue = utils_1.MathBN.sub(utils_1.MathBN.mult(utils_1.MathBN.div(applicableTotal, div), promotionValue), appliedPromoValue);
            if (applicationMethod?.type === utils_1.ApplicationMethodType.PERCENTAGE) {
                applicablePromotionValue = utils_1.MathBN.sub(utils_1.MathBN.mult(utils_1.MathBN.div(promotionValue, 100), applicableTotal), appliedPromoValue);
            }
            const amount = utils_1.MathBN.min(applicablePromotionValue, applicableTotal);
            if (utils_1.MathBN.lte(amount, 0)) {
                continue;
            }
            const budgetExceededAction = (0, usage_1.computeActionForBudgetExceeded)(promotion, amount);
            if (budgetExceededAction) {
                computedActions.push(budgetExceededAction);
                continue;
            }
            methodIdPromoValueMap.set(method.id, utils_1.MathBN.add(appliedPromoValue, amount));
            computedActions.push({
                action: utils_1.ComputedActions.ADD_SHIPPING_METHOD_ADJUSTMENT,
                shipping_method_id: method.id,
                amount,
                code: promotion.code,
            });
        }
    }
    return computedActions;
}
//# sourceMappingURL=shipping-methods.js.map