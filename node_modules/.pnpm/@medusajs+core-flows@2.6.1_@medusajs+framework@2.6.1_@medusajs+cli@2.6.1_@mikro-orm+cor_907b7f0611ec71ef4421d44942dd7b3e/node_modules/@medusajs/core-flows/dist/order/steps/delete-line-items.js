"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderLineItems = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
/**
 * This step deletes order line items.
 */
exports.deleteOrderLineItems = (0, workflows_sdk_1.createStep)("delete-order-line-items", async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const deleted = await service.softDeleteOrderLineItems(input.ids);
    return new workflows_sdk_1.StepResponse(deleted, input.ids);
}, async (ids, { container }) => {
    if (!ids) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.restoreOrderLineItems(ids);
});
//# sourceMappingURL=delete-line-items.js.map