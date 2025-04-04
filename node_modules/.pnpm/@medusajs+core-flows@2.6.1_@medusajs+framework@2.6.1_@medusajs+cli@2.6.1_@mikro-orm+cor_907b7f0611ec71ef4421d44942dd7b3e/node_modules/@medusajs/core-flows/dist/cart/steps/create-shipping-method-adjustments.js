"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShippingMethodAdjustmentsStep = exports.createShippingMethodAdjustmentsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createShippingMethodAdjustmentsStepId = "create-shipping-method-adjustments";
/**
 * This step creates shipping method adjustments for a cart.
 *
 * @example
 * const data = createShippingMethodAdjustmentsStep({
 *   "shippingMethodAdjustmentsToCreate": [{
 *     "shipping_method_id": "sm_123",
 *     "code": "10OFF",
 *     "amount": 10
 *   }]
 * })
 */
exports.createShippingMethodAdjustmentsStep = (0, workflows_sdk_1.createStep)(exports.createShippingMethodAdjustmentsStepId, async (data, { container }) => {
    const { shippingMethodAdjustmentsToCreate = [] } = data;
    if (!shippingMethodAdjustmentsToCreate?.length) {
        return new workflows_sdk_1.StepResponse(void 0, []);
    }
    const cartModuleService = container.resolve(utils_1.Modules.CART);
    const createdShippingMethodAdjustments = await cartModuleService.addShippingMethodAdjustments(shippingMethodAdjustmentsToCreate);
    return new workflows_sdk_1.StepResponse(void 0, createdShippingMethodAdjustments);
}, async (createdShippingMethodAdjustments, { container }) => {
    const cartModuleService = container.resolve(utils_1.Modules.CART);
    if (!createdShippingMethodAdjustments?.length) {
        return;
    }
    await cartModuleService.softDeleteShippingMethodAdjustments(createdShippingMethodAdjustments.map((c) => c.id));
});
//# sourceMappingURL=create-shipping-method-adjustments.js.map