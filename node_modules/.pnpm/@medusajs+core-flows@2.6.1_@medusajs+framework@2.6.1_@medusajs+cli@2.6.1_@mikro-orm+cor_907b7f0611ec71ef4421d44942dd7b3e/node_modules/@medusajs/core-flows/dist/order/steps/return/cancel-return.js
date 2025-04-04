"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderReturnStep = exports.cancelOrderReturnStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.cancelOrderReturnStepId = "cancel-order-return";
/**
 * This step cancels a return.
 */
exports.cancelOrderReturnStep = (0, workflows_sdk_1.createStep)(exports.cancelOrderReturnStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.cancelReturn(data);
    return new workflows_sdk_1.StepResponse(void 0, data.order_id);
}, async (orderId, { container }) => {
    if (!orderId) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.revertLastVersion(orderId);
});
//# sourceMappingURL=cancel-return.js.map