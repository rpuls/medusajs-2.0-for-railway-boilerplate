"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareAdjustmentsFromPromotionActionsStep = exports.prepareAdjustmentsFromPromotionActionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.prepareAdjustmentsFromPromotionActionsStepId = "prepare-adjustments-from-promotion-actions";
/**
 * This step prepares the line item or shipping method adjustments using
 * actions computed by the Promotion Module.
 *
 * @example
 * const data = prepareAdjustmentsFromPromotionActionsStep({
 *   "actions": [{
 *     "action": "addItemAdjustment",
 *     "item_id": "litem_123",
 *     "amount": 10,
 *     "code": "10OFF",
 *   }]
 * })
 */
exports.prepareAdjustmentsFromPromotionActionsStep = (0, workflows_sdk_1.createStep)(exports.prepareAdjustmentsFromPromotionActionsStepId, async (data, { container }) => {
    const promotionModuleService = container.resolve(utils_1.Modules.PROMOTION);
    const { actions = [] } = data;
    if (!actions.length) {
        return new workflows_sdk_1.StepResponse({
            lineItemAdjustmentsToCreate: [],
            lineItemAdjustmentIdsToRemove: [],
            shippingMethodAdjustmentsToCreate: [],
            shippingMethodAdjustmentIdsToRemove: [],
            computedPromotionCodes: [],
        });
    }
    const promotions = await promotionModuleService.listPromotions({ code: actions.map((a) => a.code) }, { select: ["id", "code"] });
    const promotionsMap = new Map(promotions.map((promotion) => [promotion.code, promotion]));
    const lineItemAdjustmentsToCreate = actions
        .filter((a) => a.action === utils_1.ComputedActions.ADD_ITEM_ADJUSTMENT)
        .map((action) => ({
        code: action.code,
        amount: action.amount,
        item_id: action.item_id,
        promotion_id: promotionsMap.get(action.code)?.id,
    }));
    const lineItemAdjustmentIdsToRemove = actions
        .filter((a) => a.action === utils_1.ComputedActions.REMOVE_ITEM_ADJUSTMENT)
        .map((a) => a.adjustment_id);
    const shippingMethodAdjustmentsToCreate = actions
        .filter((a) => a.action === utils_1.ComputedActions.ADD_SHIPPING_METHOD_ADJUSTMENT)
        .map((action) => ({
        code: action.code,
        amount: action.amount,
        shipping_method_id: action
            .shipping_method_id,
        promotion_id: promotionsMap.get(action.code)?.id,
    }));
    const shippingMethodAdjustmentIdsToRemove = actions
        .filter((a) => a.action === utils_1.ComputedActions.REMOVE_SHIPPING_METHOD_ADJUSTMENT)
        .map((a) => a.adjustment_id);
    const computedPromotionCodes = [
        ...lineItemAdjustmentsToCreate,
        ...shippingMethodAdjustmentsToCreate,
    ].map((adjustment) => adjustment.code);
    return new workflows_sdk_1.StepResponse({
        lineItemAdjustmentsToCreate,
        lineItemAdjustmentIdsToRemove,
        shippingMethodAdjustmentsToCreate,
        shippingMethodAdjustmentIdsToRemove,
        computedPromotionCodes,
    });
});
//# sourceMappingURL=prepare-adjustments-from-promotion-actions.js.map