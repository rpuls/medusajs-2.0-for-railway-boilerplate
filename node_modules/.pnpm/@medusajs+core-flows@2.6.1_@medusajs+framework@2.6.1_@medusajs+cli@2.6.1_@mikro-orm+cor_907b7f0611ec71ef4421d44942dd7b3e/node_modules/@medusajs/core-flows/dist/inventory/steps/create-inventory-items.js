"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInventoryItemsStep = exports.createInventoryItemsStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.createInventoryItemsStepId = "create-inventory-items";
/**
 * This step creates one or more inventory items.
 */
exports.createInventoryItemsStep = (0, workflows_sdk_1.createStep)(exports.createInventoryItemsStepId, async (data, { container }) => {
    const inventoryService = container.resolve(utils_1.Modules.INVENTORY);
    const createdItems = await inventoryService.createInventoryItems(data);
    return new workflows_sdk_1.StepResponse(createdItems, createdItems.map((i) => i.id));
}, async (data, { container }) => {
    if (!data?.length) {
        return;
    }
    const inventoryService = container.resolve(utils_1.Modules.INVENTORY);
    await inventoryService.deleteInventoryItems(data);
});
//# sourceMappingURL=create-inventory-items.js.map