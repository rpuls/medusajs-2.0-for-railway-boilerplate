"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExchangesStep = exports.deleteExchangesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteExchangesStepId = "delete-exchanges";
/**
 * This step deletes one or more exchanges.
 */
exports.deleteExchangesStep = (0, workflows_sdk_1.createStep)(exports.deleteExchangesStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const deleted = await service.softDeleteOrderExchanges(data.ids);
    return new workflows_sdk_1.StepResponse(deleted, data.ids);
}, async (ids, { container }) => {
    if (!ids) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.restoreOrderExchanges(ids);
});
//# sourceMappingURL=delete-exchanges.js.map