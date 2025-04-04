"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrderFulfillmentStep = exports.registerOrderFulfillmentStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.registerOrderFulfillmentStepId = "register-order-fullfillment";
/**
 * This step registers a fulfillment for an order.
 *
 * @example
 * const data = registerOrderFulfillmentStep({
 *   order_id: "order_123",
 *   items: [{
 *     id: "item_123",
 *     quantity: 1
 *   }],
 * })
 */
exports.registerOrderFulfillmentStep = (0, workflows_sdk_1.createStep)(exports.registerOrderFulfillmentStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.registerFulfillment(data);
    return new workflows_sdk_1.StepResponse(void 0, data.order_id);
}, async (orderId, { container }) => {
    if (!orderId) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.revertLastVersion(orderId);
});
//# sourceMappingURL=register-fulfillment.js.map