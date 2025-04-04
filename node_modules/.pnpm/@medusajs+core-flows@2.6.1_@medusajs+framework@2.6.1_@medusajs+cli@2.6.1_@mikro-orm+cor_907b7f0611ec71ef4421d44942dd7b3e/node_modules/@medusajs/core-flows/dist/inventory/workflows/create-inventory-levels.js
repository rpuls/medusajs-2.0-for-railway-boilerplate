"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInventoryLevelsWorkflow = exports.createInventoryLevelsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.createInventoryLevelsWorkflowId = "create-inventory-levels-workflow";
/**
 * This workflow creates one or more inventory levels. It's used by the
 * [Create Inventory Level API Route](https://docs.medusajs.com/api/admin#inventory-items_postinventoryitemsidlocationlevels).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create inventory levels in your custom flows.
 *
 * @example
 * const { result } = await createInventoryLevelsWorkflow(container)
 * .run({
 *   input: {
 *     inventory_levels: [
 *       {
 *         inventory_item_id: "iitem_123",
 *         location_id: "sloc_123",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more inventory levels.
 */
exports.createInventoryLevelsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createInventoryLevelsWorkflowId, (input) => {
    (0, steps_1.validateInventoryLocationsStep)(input.inventory_levels);
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.createInventoryLevelsStep)(input.inventory_levels));
});
//# sourceMappingURL=create-inventory-levels.js.map