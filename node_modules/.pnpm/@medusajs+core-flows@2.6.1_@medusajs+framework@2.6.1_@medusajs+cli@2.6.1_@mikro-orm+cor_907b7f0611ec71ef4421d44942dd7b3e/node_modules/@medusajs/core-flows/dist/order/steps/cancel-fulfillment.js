"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderFulfillmentStep = exports.cancelOrderFulfillmentStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.cancelOrderFulfillmentStepId = "cancel-order-fulfillment";
/**
 * This step cancels an order's fulfillment.
 *
 * @example
 * const data = cancelOrderFulfillmentStep({
 *   order_id: "order_123",
 *   items: [
 *     {
 *       id: "item_123",
 *       quantity: 1
 *     }
 *   ]
 * })
 */
exports.cancelOrderFulfillmentStep = (0, workflows_sdk_1.createStep)(exports.cancelOrderFulfillmentStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.cancelFulfillment(data);
    return new workflows_sdk_1.StepResponse(void 0, data.order_id);
}, async (orderId, { container }) => {
    if (!orderId) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.revertLastVersion(orderId);
});
//# sourceMappingURL=cancel-fulfillment.js.map