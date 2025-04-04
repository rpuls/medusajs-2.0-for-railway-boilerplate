"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInventoryItemsWorkflow = exports.updateInventoryItemsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.updateInventoryItemsWorkflowId = "update-inventory-items-workflow";
/**
 * This workflow updates one or more inventory items. It's used by the
 * [Update an Inventory Item Admin API Route](https://docs.medusajs.com/api/admin#inventory-items_postinventoryitemsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update inventory items in your custom flows.
 *
 * @example
 * const { result } = await updateInventoryItemsWorkflow(container)
 * .run({
 *   input: {
 *     updates: [
 *       {
 *         id: "iitem_123",
 *         sku: "shirt",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Update one or more inventory items.
 */
exports.updateInventoryItemsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateInventoryItemsWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.updateInventoryItemsStep)(input.updates));
});
//# sourceMappingURL=update-inventory-items.js.map