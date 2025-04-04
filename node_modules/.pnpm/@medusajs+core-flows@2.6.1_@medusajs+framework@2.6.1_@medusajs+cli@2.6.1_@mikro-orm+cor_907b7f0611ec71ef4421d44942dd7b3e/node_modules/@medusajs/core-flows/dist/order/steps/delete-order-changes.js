"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderChangesStep = exports.deleteOrderChangesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteOrderChangesStepId = "delete-order-change";
/**
 * This step deletes order changes.
 */
exports.deleteOrderChangesStep = (0, workflows_sdk_1.createStep)(exports.deleteOrderChangesStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const deleted = await service.softDeleteOrderChanges(data.ids);
    return new workflows_sdk_1.StepResponse(deleted, data.ids);
}, async (ids, { container }) => {
    if (!ids) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.restoreOrderChanges(ids);
});
//# sourceMappingURL=delete-order-changes.js.map