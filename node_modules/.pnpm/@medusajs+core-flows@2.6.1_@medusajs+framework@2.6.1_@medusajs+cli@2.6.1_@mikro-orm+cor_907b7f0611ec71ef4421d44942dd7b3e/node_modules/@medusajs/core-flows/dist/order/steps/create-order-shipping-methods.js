"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderShippingMethods = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
/**
 * This step creates order shipping methods.
 */
exports.createOrderShippingMethods = (0, workflows_sdk_1.createStep)("create-order-shipping-methods", async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const created = await service.createOrderShippingMethods(input.shipping_methods);
    return new workflows_sdk_1.StepResponse(created, created.map((c) => c.id));
}, async (createdMethodIds, { container }) => {
    if (!createdMethodIds) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.deleteOrderShippingMethods(createdMethodIds);
});
//# sourceMappingURL=create-order-shipping-methods.js.map