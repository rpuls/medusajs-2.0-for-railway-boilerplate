"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderClaimStep = exports.cancelOrderClaimStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.cancelOrderClaimStepId = "cancel-order-claim";
/**
 * This step cancels a claim.
 */
exports.cancelOrderClaimStep = (0, workflows_sdk_1.createStep)(exports.cancelOrderClaimStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.cancelClaim(data);
    return new workflows_sdk_1.StepResponse(void 0, data.order_id);
}, async (orderId, { container }) => {
    if (!orderId) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.revertLastVersion(orderId);
});
//# sourceMappingURL=cancel-claim.js.map