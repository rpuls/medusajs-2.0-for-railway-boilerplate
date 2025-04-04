"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderClaimsStep = exports.createOrderClaimsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createOrderClaimsStepId = "create-order-claims";
/**
 * This step creates one or more order claims.
 */
exports.createOrderClaimsStep = (0, workflows_sdk_1.createStep)(exports.createOrderClaimsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const orderClaims = await service.createOrderClaims(data);
    const claimIds = orderClaims.map((claim) => claim.id);
    return new workflows_sdk_1.StepResponse(orderClaims, claimIds);
}, async (claimIds, { container }) => {
    if (!claimIds) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.deleteOrderClaims(claimIds);
});
//# sourceMappingURL=create-claims.js.map