"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmInventoryStep = exports.confirmInventoryStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.confirmInventoryStepId = "confirm-inventory-step";
/**
 * This step validates that items in the cart have sufficient inventory quantity.
 * If an item doesn't have sufficient inventory, an error is thrown.
 *
 * @example
 * confirmInventoryStep({
 *   items: [
 *     {
 *       inventory_item_id: "iitem_123",
 *       required_quantity: 1,
 *       allow_backorder: false,
 *       quantity: 1,
 *       location_ids: ["sloc_123"]
 *     }
 *   ]
 * })
 */
exports.confirmInventoryStep = (0, workflows_sdk_1.createStep)(exports.confirmInventoryStepId, async (data, { container }) => {
    if (!data.items?.length) {
        return new workflows_sdk_1.StepResponse([], []);
    }
    const inventoryService = container.resolve(utils_1.Modules.INVENTORY);
    // TODO: Should be bulk
    const promises = data.items.map(async (item) => {
        if (item.allow_backorder) {
            return true;
        }
        const itemQuantity = utils_1.MathBN.mult(item.quantity, item.required_quantity);
        return await inventoryService.confirmInventory(item.inventory_item_id, item.location_ids, itemQuantity);
    });
    const inventoryCoverage = await (0, utils_1.promiseAll)(promises);
    if (inventoryCoverage.some((hasCoverage) => !hasCoverage)) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `Some variant does not have the required inventory`, utils_1.MedusaError.Codes.INSUFFICIENT_INVENTORY);
    }
    return new workflows_sdk_1.StepResponse(null);
});
//# sourceMappingURL=confirm-inventory.js.map