"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInventoryItemStep = exports.deleteInventoryItemStepId = exports.validateInventoryDeleteStep = exports.validateVariantInventoryStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.validateVariantInventoryStepId = "validate-inventory-item-delete";
exports.validateInventoryDeleteStep = (0, workflows_sdk_1.createStep)(exports.validateVariantInventoryStepId, async (data) => {
    const nonDeletable = data.inventory_items.filter((inventoryItem) => {
        return utils_1.MathBN.gt(inventoryItem.reserved_quantity, 0);
    });
    if (nonDeletable.length) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cannot remove following inventory item(s) since they have reservations: [${nonDeletable
            .map((inventoryItem) => inventoryItem.id)
            .join(", ")}].`);
    }
});
exports.deleteInventoryItemStepId = "delete-inventory-item-step";
/**
 * This step deletes one or more inventory items.
 */
exports.deleteInventoryItemStep = (0, workflows_sdk_1.createStep)(exports.deleteInventoryItemStepId, async (ids, { container }) => {
    const inventoryService = container.resolve(utils_1.Modules.INVENTORY);
    await inventoryService.softDeleteInventoryItems(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevInventoryItemIds, { container }) => {
    if (!prevInventoryItemIds?.length) {
        return;
    }
    const inventoryService = container.resolve(utils_1.Modules.INVENTORY);
    await inventoryService.restoreInventoryItems(prevInventoryItemIds);
});
//# sourceMappingURL=delete-inventory-items.js.map