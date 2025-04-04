"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInventoryItemsWorkflow = exports.createInventoryItemsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
const create_inventory_levels_1 = require("./create-inventory-levels");
const buildLocationLevelMapAndItemData = (data) => {
    data.items = data.items ?? [];
    const inventoryItems = [];
    // Keep an index to location levels mapping to inject the created inventory item
    // id into the location levels workflow input
    const locationLevelMap = {};
    data.items.forEach(({ location_levels, ...inventoryItem }, index) => {
        locationLevelMap[index] = location_levels?.length ? location_levels : [];
        inventoryItems.push(inventoryItem);
    });
    return {
        locationLevelMap,
        inventoryItems,
    };
};
const buildInventoryLevelsInput = (data) => {
    const inventoryLevels = [];
    // The order of the input is critical to accurately create location levels for
    // the right inventory item
    data.items.forEach((item, index) => {
        const locationLevels = data.locationLevelMap[index] || [];
        locationLevels.forEach((locationLevel) => inventoryLevels.push({
            ...locationLevel,
            inventory_item_id: item.id,
        }));
    });
    return {
        input: {
            inventory_levels: inventoryLevels,
        },
    };
};
exports.createInventoryItemsWorkflowId = "create-inventory-items-workflow";
/**
 * This workflow creates one or more inventory items. It's used by the
 * [Create Inventory Item Admin API Route](https://docs.medusajs.com/api/admin#inventory-items_postinventoryitems).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create inventory items in your custom flows.
 *
 * @example
 * const { result } = await createInventoryItemsWorkflow(container)
 * .run({
 *   input: {
 *     items: [
 *       {
 *         sku: "shirt",
 *         location_levels: [
 *           {
 *             location_id: "sloc_123",
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more inventory items.
 */
exports.createInventoryItemsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createInventoryItemsWorkflowId, (input) => {
    const { locationLevelMap, inventoryItems } = (0, workflows_sdk_1.transform)(input, buildLocationLevelMapAndItemData);
    const items = (0, steps_1.createInventoryItemsStep)(inventoryItems);
    const inventoryLevelsInput = (0, workflows_sdk_1.transform)({ items, locationLevelMap }, buildInventoryLevelsInput);
    create_inventory_levels_1.createInventoryLevelsWorkflow.runAsStep(inventoryLevelsInput);
    return new workflows_sdk_1.WorkflowResponse(items);
});
//# sourceMappingURL=create-inventory-items.js.map