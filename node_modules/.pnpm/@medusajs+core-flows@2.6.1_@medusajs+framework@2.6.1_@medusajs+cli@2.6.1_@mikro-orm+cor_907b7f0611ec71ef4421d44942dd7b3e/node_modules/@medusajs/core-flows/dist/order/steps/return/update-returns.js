"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReturnsStep = exports.updateReturnsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateReturnsStepId = "update-returns";
/**
 * This step updates one or more returns.
 */
exports.updateReturnsStep = (0, workflows_sdk_1.createStep)(exports.updateReturnsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)(data, {
        objectFields: ["metadata"],
    });
    const dataBeforeUpdate = await service.listReturns({ id: data.map((d) => d.id) }, { relations, select: selects });
    const updated = await service.updateReturns(data);
    return new workflows_sdk_1.StepResponse(updated, dataBeforeUpdate);
}, async (dataBeforeUpdate, { container }) => {
    if (!dataBeforeUpdate?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.updateReturns(dataBeforeUpdate);
});
//# sourceMappingURL=update-returns.js.map