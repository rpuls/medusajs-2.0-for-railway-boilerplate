"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeShippingMethodAdjustmentsStep = exports.removeShippingMethodAdjustmentsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.removeShippingMethodAdjustmentsStepId = "remove-shipping-method-adjustments";
/**
 * This step removes shipping method adjustments from a cart.
 */
exports.removeShippingMethodAdjustmentsStep = (0, workflows_sdk_1.createStep)(exports.removeShippingMethodAdjustmentsStepId, async (data, { container }) => {
    const { shippingMethodAdjustmentIdsToRemove = [] } = data;
    if (!shippingMethodAdjustmentIdsToRemove?.length) {
        return new workflows_sdk_1.StepResponse(void 0, []);
    }
    const cartModuleService = container.resolve(utils_1.Modules.CART);
    await cartModuleService.softDeleteShippingMethodAdjustments(shippingMethodAdjustmentIdsToRemove);
    return new workflows_sdk_1.StepResponse(void 0, shippingMethodAdjustmentIdsToRemove);
}, async (shippingMethodAdjustmentIdsToRemove, { container }) => {
    const cartModuleService = container.resolve(utils_1.Modules.CART);
    if (!shippingMethodAdjustmentIdsToRemove?.length) {
        return;
    }
    await cartModuleService.restoreShippingMethodAdjustments(shippingMethodAdjustmentIdsToRemove);
});
//# sourceMappingURL=remove-shipping-method-adjustments.js.map