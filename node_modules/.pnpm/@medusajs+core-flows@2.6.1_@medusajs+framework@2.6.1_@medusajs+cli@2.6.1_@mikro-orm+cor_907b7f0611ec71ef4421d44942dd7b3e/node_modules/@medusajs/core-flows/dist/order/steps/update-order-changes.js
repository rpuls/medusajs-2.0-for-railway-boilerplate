"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderChangesStep = exports.updateOrderChangesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateOrderChangesStepId = "update-order-changes";
/**
 * This step updates order change.
 */
exports.updateOrderChangesStep = (0, workflows_sdk_1.createStep)(exports.updateOrderChangesStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)(data, {
        objectFields: ["metadata"],
    });
    const dataBeforeUpdate = await service.listOrderChanges({ id: data.map((d) => d.id) }, { relations, select: selects });
    const updated = await service.updateOrderChanges(data);
    return new workflows_sdk_1.StepResponse(updated, dataBeforeUpdate);
}, async (dataBeforeUpdate, { container }) => {
    if (!dataBeforeUpdate?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.updateOrderChanges(dataBeforeUpdate);
});
//# sourceMappingURL=update-order-changes.js.map