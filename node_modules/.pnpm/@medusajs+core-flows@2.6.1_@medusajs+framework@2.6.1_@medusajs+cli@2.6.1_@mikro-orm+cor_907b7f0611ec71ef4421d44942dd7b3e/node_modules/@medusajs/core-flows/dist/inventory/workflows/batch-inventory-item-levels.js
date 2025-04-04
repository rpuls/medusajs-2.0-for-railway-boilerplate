"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchInventoryItemLevelsWorkflow = exports.batchInventoryItemLevelsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
const delete_inventory_levels_1 = require("./delete-inventory-levels");
exports.batchInventoryItemLevelsWorkflowId = "batch-inventory-item-levels-workflow";
/**
 * This workflow creates, updates and deletes inventory levels in bulk.
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to manage inventory levels in your custom flows.
 *
 * @example
 * const { result } = await batchInventoryItemLevelsWorkflow(container)
 * .run({
 *   input: {
 *     create: [
 *       {
 *         inventory_item_id: "iitem_123",
 *         location_id: "sloc_123"
 *       }
 *     ],
 *     update: [
 *       {
 *         id: "iilev_123",
 *         inventory_item_id: "iitem_123",
 *         location_id: "sloc_123",
 *         stocked_quantity: 10
 *       }
 *     ],
 *     delete: ["iilev_321"]
 *   }
 * })
 *
 * @summary
 *
 * Manage inventory levels in bulk.
 */
exports.batchInventoryItemLevelsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.batchInventoryItemLevelsWorkflowId, (input) => {
    const { createInput, updateInput, deleteInput } = (0, workflows_sdk_1.transform)(input, (data) => {
        return {
            createInput: data.create || [],
            updateInput: data.update || [],
            deleteInput: {
                id: data.delete || [],
                force: data.force ?? false,
            },
        };
    });
    const res = (0, workflows_sdk_1.parallelize)((0, steps_1.createInventoryLevelsStep)(createInput), (0, steps_1.updateInventoryLevelsStep)(updateInput), delete_inventory_levels_1.deleteInventoryLevelsWorkflow.runAsStep({
        input: deleteInput,
    }));
    return new workflows_sdk_1.WorkflowResponse((0, workflows_sdk_1.transform)({ res, input }, (data) => {
        return {
            created: data.res[0],
            updated: data.res[1],
            deleted: data.input.delete,
        };
    }));
});
//# sourceMappingURL=batch-inventory-item-levels.js.map