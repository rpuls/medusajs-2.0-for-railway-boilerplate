"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmOrderChanges = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
/**
 * This step confirms changes of an order.
 */
exports.confirmOrderChanges = (0, workflows_sdk_1.createStep)("confirm-order-changes", async (input, { container }) => {
    const orderModuleService = container.resolve(utils_1.Modules.ORDER);
    const currentChanges = [];
    await orderModuleService.confirmOrderChange(input.changes.map((action) => {
        const update = {
            id: action.id,
            confirmed_by: input.confirmed_by,
        };
        currentChanges.push({
            ...update,
            order_id: input.orderId,
            status: action.status,
        });
        return update;
    }));
    return new workflows_sdk_1.StepResponse(null, currentChanges);
}, async (currentChanges, { container }) => {
    if (!currentChanges?.length) {
        return;
    }
    const orderModuleService = container.resolve(utils_1.Modules.ORDER);
    await orderModuleService.undoLastChange(currentChanges[0].order_id, currentChanges[0]);
});
//# sourceMappingURL=confirm-order-changes.js.map