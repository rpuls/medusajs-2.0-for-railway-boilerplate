"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInventoryItemWorkflow = exports.deleteInventoryItemWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
const steps_1 = require("../steps");
const remove_remote_links_1 = require("../../common/steps/remove-remote-links");
const common_1 = require("../../common");
exports.deleteInventoryItemWorkflowId = "delete-inventory-item-workflow";
/**
 * This workflow deletes one or more inventory items. It's used by the
 * [Delete Inventory Item Admin API Route](https://docs.medusajs.com/api/admin#inventory-items_deleteinventoryitemsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete inventory items in your custom flows.
 *
 * @example
 * const { result } = await deleteInventoryItemWorkflow(container)
 * .run({
 *   input: ["iitem_123"]
 * })
 *
 * @summary
 *
 * Delete one or more inventory items.
 */
exports.deleteInventoryItemWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteInventoryItemWorkflowId, (input) => {
    const { data: inventoryItemsToDelete } = (0, common_1.useQueryGraphStep)({
        entity: "inventory",
        fields: ["id", "reserved_quantity"],
        filters: {
            id: input,
        },
    });
    (0, steps_1.validateInventoryDeleteStep)({ inventory_items: inventoryItemsToDelete });
    (0, steps_1.deleteInventoryItemStep)(input);
    (0, remove_remote_links_1.removeRemoteLinkStep)({
        [utils_1.Modules.INVENTORY]: { inventory_item_id: input },
    });
    return new workflows_sdk_1.WorkflowResponse(input);
});
//# sourceMappingURL=delete-inventory-items.js.map