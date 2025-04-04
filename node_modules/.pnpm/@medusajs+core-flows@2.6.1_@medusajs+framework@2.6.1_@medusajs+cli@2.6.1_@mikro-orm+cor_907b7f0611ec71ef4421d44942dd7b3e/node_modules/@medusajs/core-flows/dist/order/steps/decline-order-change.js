"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declineOrderChangeStep = exports.declineOrderChangeStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.declineOrderChangeStepId = "decline-order-change";
/**
 * This step declines an order change.
 */
exports.declineOrderChangeStep = (0, workflows_sdk_1.createStep)(exports.declineOrderChangeStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([data], { objectFields: ["metadata"] });
    selects.push("order_id", "return_id", "claim_id", "exchange_id", "version", "declined_at", "declined_by", "declined_reason");
    const dataBeforeUpdate = await service.retrieveOrderChange(data.id, {
        select: (0, utils_1.deduplicate)(selects),
        relations,
    });
    await service.declineOrderChange(data);
    return new workflows_sdk_1.StepResponse(void 0, dataBeforeUpdate);
}, async (rollbackData, { container }) => {
    if (!rollbackData) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.updateOrderChanges(rollbackData);
});
//# sourceMappingURL=decline-order-change.js.map