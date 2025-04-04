"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderExchangeStep = exports.cancelOrderExchangeStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.cancelOrderExchangeStepId = "cancel-order-swap";
/**
 * This step cancels an exchange.
 */
exports.cancelOrderExchangeStep = (0, workflows_sdk_1.createStep)(exports.cancelOrderExchangeStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.cancelExchange(data);
    return new workflows_sdk_1.StepResponse(void 0, data.order_id);
}, async (orderId, { container }) => {
    if (!orderId) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.revertLastVersion(orderId);
});
//# sourceMappingURL=cancel-exchange.js.map