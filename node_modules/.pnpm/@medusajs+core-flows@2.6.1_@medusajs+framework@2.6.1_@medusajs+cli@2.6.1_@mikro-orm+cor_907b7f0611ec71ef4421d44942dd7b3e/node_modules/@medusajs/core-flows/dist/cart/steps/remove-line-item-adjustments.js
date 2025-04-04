"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeLineItemAdjustmentsStep = exports.removeLineItemAdjustmentsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.removeLineItemAdjustmentsStepId = "remove-line-item-adjustments";
/**
 * This step removes line item adjustments from a cart.
 */
exports.removeLineItemAdjustmentsStep = (0, workflows_sdk_1.createStep)(exports.removeLineItemAdjustmentsStepId, async (data, { container }) => {
    const { lineItemAdjustmentIdsToRemove = [] } = data;
    if (!lineItemAdjustmentIdsToRemove?.length) {
        return new workflows_sdk_1.StepResponse(void 0, []);
    }
    const cartModuleService = container.resolve(utils_1.Modules.CART);
    await cartModuleService.softDeleteLineItemAdjustments(lineItemAdjustmentIdsToRemove);
    return new workflows_sdk_1.StepResponse(void 0, lineItemAdjustmentIdsToRemove);
}, async (lineItemAdjustmentIdsToRemove, { container }) => {
    const cartModuleService = container.resolve(utils_1.Modules.CART);
    if (!lineItemAdjustmentIdsToRemove?.length) {
        return;
    }
    await cartModuleService.restoreLineItemAdjustments(lineItemAdjustmentIdsToRemove);
});
//# sourceMappingURL=remove-line-item-adjustments.js.map