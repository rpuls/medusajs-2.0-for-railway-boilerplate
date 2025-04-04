"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReturnItemsFromActionsStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
/**
 * This step creates return items from change actions.
 */
exports.createReturnItemsFromActionsStep = (0, workflows_sdk_1.createStep)("create-return-items-from-change-actions", async (input, { container }) => {
    const orderModuleService = container.resolve(utils_1.Modules.ORDER);
    const returnItems = input.changes.map((item) => {
        return {
            return_id: input.returnId,
            item_id: item.details?.reference_id,
            reason_id: item.details?.reason_id,
            quantity: item.details?.quantity,
            note: item.internal_note,
            metadata: item.details?.metadata ?? {},
        };
    });
    const createdReturnItems = await orderModuleService.createReturnItems(returnItems);
    return new workflows_sdk_1.StepResponse(createdReturnItems, createdReturnItems.map((i) => i.id));
}, async (ids, { container }) => {
    if (!ids) {
        return;
    }
    const orderModuleService = container.resolve(utils_1.Modules.ORDER);
    await orderModuleService.deleteReturnItems(ids);
});
//# sourceMappingURL=create-return-items-from-actions.js.map