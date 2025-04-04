"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReturnsStep = exports.deleteReturnsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteReturnsStepId = "delete-return";
/**
 * This step deletes one or more returns.
 */
exports.deleteReturnsStep = (0, workflows_sdk_1.createStep)(exports.deleteReturnsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const ids = data.ids.filter(Boolean);
    const deleted = ids.length ? await service.softDeleteReturns(ids) : [];
    return new workflows_sdk_1.StepResponse(deleted, data.ids);
}, async (ids, { container }) => {
    if (!ids?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.restoreReturns(ids);
});
//# sourceMappingURL=delete-returns.js.map