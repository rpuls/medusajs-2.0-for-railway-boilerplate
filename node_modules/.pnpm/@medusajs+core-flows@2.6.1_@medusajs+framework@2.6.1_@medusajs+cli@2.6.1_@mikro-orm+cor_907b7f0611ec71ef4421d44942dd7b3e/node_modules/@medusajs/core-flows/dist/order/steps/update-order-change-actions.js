"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderChangeActionsStep = exports.updateOrderChangeActionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateOrderChangeActionsStepId = "update-order-change-actions";
/**
 * This step updates order change actions.
 */
exports.updateOrderChangeActionsStep = (0, workflows_sdk_1.createStep)(exports.updateOrderChangeActionsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)(data, {
        objectFields: ["metadata", "details"],
    });
    selects.push("order_id", "return_id", "claim_id", "exchange_id", "version", "order_change_id");
    const dataBeforeUpdate = await service.listOrderChangeActions({ id: data.map((d) => d.id) }, { relations, select: (0, utils_1.deduplicate)(selects) });
    const updated = await service.updateOrderChangeActions(data);
    return new workflows_sdk_1.StepResponse(updated, dataBeforeUpdate);
}, async (dataBeforeUpdate, { container }) => {
    if (!dataBeforeUpdate?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.updateOrderChangeActions(dataBeforeUpdate);
});
//# sourceMappingURL=update-order-change-actions.js.map