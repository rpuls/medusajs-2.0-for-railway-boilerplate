"use strict";
// TODO: Remove this workflow in a future release.
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateDeleteLevelsWorkflow = exports.bulkCreateDeleteLevelsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
const delete_inventory_levels_1 = require("./delete-inventory-levels");
exports.bulkCreateDeleteLevelsWorkflowId = "bulk-create-delete-levels-workflow";
/**
 * This workflow creates and deletes inventory levels.
 *
 * @deprecated Use `batchInventoryItemLevels` instead.
 */
exports.bulkCreateDeleteLevelsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.bulkCreateDeleteLevelsWorkflowId, (input) => {
    (0, workflows_sdk_1.when)({ input }, ({ input }) => {
        return !!input.deletes?.length;
    }).then(() => {
        delete_inventory_levels_1.deleteInventoryLevelsWorkflow.runAsStep({
            input: {
                $or: input.deletes,
            },
        });
    });
    const created = (0, workflows_sdk_1.when)({ input }, ({ input }) => {
        return !!input.creates?.length;
    }).then(() => {
        return (0, steps_1.createInventoryLevelsStep)(input.creates);
    });
    return new workflows_sdk_1.WorkflowResponse(created || []);
});
//# sourceMappingURL=bulk-create-delete-levels.js.map