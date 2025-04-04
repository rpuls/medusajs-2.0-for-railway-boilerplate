"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderShippingMethods = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
/**
 * This step deletes order shipping methods.
 */
exports.deleteOrderShippingMethods = (0, workflows_sdk_1.createStep)("delete-order-shipping-methods", async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const deleted = await service.softDeleteOrderShippingMethods(input.ids);
    return new workflows_sdk_1.StepResponse(deleted, input.ids);
}, async (ids, { container }) => {
    if (!ids) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.restoreOrderShippingMethods(ids);
});
//# sourceMappingURL=delete-order-shipping-methods.js.map