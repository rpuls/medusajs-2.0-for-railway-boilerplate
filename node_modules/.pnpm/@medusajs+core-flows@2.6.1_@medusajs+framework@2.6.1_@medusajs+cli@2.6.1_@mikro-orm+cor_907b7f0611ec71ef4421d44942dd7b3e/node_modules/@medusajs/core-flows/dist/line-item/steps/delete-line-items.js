"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLineItemsStep = exports.deleteLineItemsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteLineItemsStepId = "delete-line-items";
/**
 * This step deletes line items.
 */
exports.deleteLineItemsStep = (0, workflows_sdk_1.createStep)(exports.deleteLineItemsStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.CART);
    await service.softDeleteLineItems(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (ids, { container }) => {
    if (!ids?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.CART);
    await service.restoreLineItems(ids);
});
//# sourceMappingURL=delete-line-items.js.map