"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClaimsStep = exports.deleteClaimsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteClaimsStepId = "delete-claims";
/**
 * This step deletes one or more order claims.
 */
exports.deleteClaimsStep = (0, workflows_sdk_1.createStep)(exports.deleteClaimsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const deleted = await service.softDeleteOrderClaims(data.ids);
    return new workflows_sdk_1.StepResponse(deleted, data.ids);
}, async (ids, { container }) => {
    if (!ids) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.restoreOrderClaims(ids);
});
//# sourceMappingURL=delete-claims.js.map