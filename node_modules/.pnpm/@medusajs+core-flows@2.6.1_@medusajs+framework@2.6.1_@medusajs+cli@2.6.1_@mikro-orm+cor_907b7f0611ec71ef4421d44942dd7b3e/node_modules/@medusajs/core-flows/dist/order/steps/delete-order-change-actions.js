"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderChangeActionsStep = exports.deleteOrderChangeActionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteOrderChangeActionsStepId = "delete-order-change-actions";
/**
 * This step deletes order change actions.
 */
exports.deleteOrderChangeActionsStep = (0, workflows_sdk_1.createStep)(exports.deleteOrderChangeActionsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.softDeleteOrderChangeActions(data.ids);
    return new workflows_sdk_1.StepResponse(void 0, data.ids);
}, async (ids, { container }) => {
    if (!ids?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.restoreOrderChangeActions(ids);
});
//# sourceMappingURL=delete-order-change-actions.js.map