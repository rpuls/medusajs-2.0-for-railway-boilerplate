"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderClaimsStep = exports.updateOrderClaimsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateOrderClaimsStepId = "update-order-claim";
/**
 * This step updates one or more claims.
 */
exports.updateOrderClaimsStep = (0, workflows_sdk_1.createStep)(exports.updateOrderClaimsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)(data, {
        objectFields: ["metadata"],
    });
    const dataBeforeUpdate = (await service.listOrderClaims({ id: data.map((d) => d.id) }, { relations, select: selects }));
    const updated = await service.updateOrderClaims(data.map((dt) => {
        const { id, ...rest } = dt;
        return {
            selector: { id },
            data: rest,
        };
    }));
    return new workflows_sdk_1.StepResponse(updated, dataBeforeUpdate);
}, async (dataBeforeUpdate, { container }) => {
    if (!dataBeforeUpdate?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.updateOrderClaims(dataBeforeUpdate.map((dt) => {
        const { id, ...rest } = dt;
        return {
            selector: { id },
            data: rest,
        };
    }));
});
//# sourceMappingURL=update-order-claims.js.map