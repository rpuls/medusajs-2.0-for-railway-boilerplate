"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInventoryLevelsWorkflow = exports.updateInventoryLevelsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const update_inventory_levels_1 = require("../steps/update-inventory-levels");
exports.updateInventoryLevelsWorkflowId = "update-inventory-levels-workflow";
/**
 * This workflow updates one or more inventory levels. It's used by the
 * [Update Inventory Level Admin API Route](https://docs.medusajs.com/api/admin#inventory-items_postinventoryitemsidlocationlevelslocation_id).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update inventory levels in your custom flows.
 *
 * @example
 * const { result } = await updateInventoryLevelsWorkflow(container)
 * .run({
 *   input: {
 *     updates: [
 *       {
 *         id: "iilev_123",
 *         inventory_item_id: "iitem_123",
 *         location_id: "sloc_123",
 *         stocked_quantity: 10,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Update one or more inventory levels.
 */
exports.updateInventoryLevelsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateInventoryLevelsWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, update_inventory_levels_1.updateInventoryLevelsStep)(input.updates));
});
//# sourceMappingURL=update-inventory-levels.js.map