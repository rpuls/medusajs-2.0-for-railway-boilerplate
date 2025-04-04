"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reserveInventoryStep = exports.reserveInventoryStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.reserveInventoryStepId = "reserve-inventory-step";
/**
 * This step reserves the quantity of line items from the associated
 * variant's inventory.
 *
 * @example
 * const data = reserveInventoryStep({
 *   "items": [{
 *     "inventory_item_id": "iitem_123",
 *     "required_quantity": 1,
 *     "allow_backorder": false,
 *     "quantity": 1,
 *     "location_ids": [
 *       "sloc_123"
 *     ]
 *   }]
 * })
 */
exports.reserveInventoryStep = (0, workflows_sdk_1.createStep)(exports.reserveInventoryStepId, async (data, { container }) => {
    if (!data.items.length) {
        return new workflows_sdk_1.StepResponse([], {
            reservations: [],
            inventoryItemIds: [],
        });
    }
    const inventoryService = container.resolve(utils_1.Modules.INVENTORY);
    const locking = container.resolve(utils_1.Modules.LOCKING);
    const inventoryItemIds = [];
    const items = data.items.map((item) => {
        inventoryItemIds.push(item.inventory_item_id);
        return {
            line_item_id: item.id,
            inventory_item_id: item.inventory_item_id,
            quantity: utils_1.MathBN.mult(item.required_quantity, item.quantity),
            allow_backorder: item.allow_backorder,
            location_id: item.location_ids[0],
        };
    });
    const lockingKeys = Array.from(new Set(inventoryItemIds));
    const reservations = await locking.execute(lockingKeys, async () => {
        return await inventoryService.createReservationItems(items);
    });
    return new workflows_sdk_1.StepResponse(reservations, {
        reservations: reservations.map((r) => r.id),
        inventoryItemIds,
    });
}, async (data, { container }) => {
    if (!data?.reservations?.length) {
        return;
    }
    const inventoryService = container.resolve(utils_1.Modules.INVENTORY);
    const locking = container.resolve(utils_1.Modules.LOCKING);
    const inventoryItemIds = data.inventoryItemIds;
    const lockingKeys = Array.from(new Set(inventoryItemIds));
    await locking.execute(lockingKeys, async () => {
        await inventoryService.deleteReservationItems(data.reservations);
    });
    return new workflows_sdk_1.StepResponse();
});
//# sourceMappingURL=reserve-inventory.js.map