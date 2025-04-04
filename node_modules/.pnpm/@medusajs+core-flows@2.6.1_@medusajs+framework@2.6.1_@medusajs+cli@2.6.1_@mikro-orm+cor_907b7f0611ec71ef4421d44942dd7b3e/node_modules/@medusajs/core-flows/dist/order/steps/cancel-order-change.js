"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderChangeStep = exports.cancelOrderChangeStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.cancelOrderChangeStepId = "cancel-order-change";
/**
 * This step cancels an order change.
 */
exports.cancelOrderChangeStep = (0, workflows_sdk_1.createStep)(exports.cancelOrderChangeStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([data], { objectFields: ["metadata"] });
    selects.push("order_id", "return_id", "claim_id", "exchange_id", "version", "canceled_at", "canceled_by");
    const dataBeforeUpdate = await service.retrieveOrderChange(data.id, {
        select: (0, utils_1.deduplicate)(selects),
        relations,
    });
    await service.cancelOrderChange(data);
    return new workflows_sdk_1.StepResponse(void 0, dataBeforeUpdate);
}, async (rollbackData, { container }) => {
    if (!rollbackData) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.updateOrderChanges(rollbackData);
});
//# sourceMappingURL=cancel-order-change.js.map