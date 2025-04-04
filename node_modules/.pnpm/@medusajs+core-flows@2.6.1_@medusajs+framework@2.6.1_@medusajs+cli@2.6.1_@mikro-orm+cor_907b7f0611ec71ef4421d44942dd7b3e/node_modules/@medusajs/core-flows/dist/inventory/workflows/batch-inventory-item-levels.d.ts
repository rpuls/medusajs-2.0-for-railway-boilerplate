import { BatchWorkflowInput, BatchWorkflowOutput, InventoryLevelDTO, InventoryTypes } from "@medusajs/types";
/**
 * The data to manage the inventory levels in bulk.
 *
 * @property create - The inventory levels to create.
 * @property update - The inventory levels to update.
 * @property delete - The IDs of inventory levels to delete.
 */
export interface BatchInventoryItemLevelsWorkflowInput extends BatchWorkflowInput<InventoryTypes.CreateInventoryLevelInput, InventoryTypes.UpdateInventoryLevelInput> {
    /**
     * If true, the workflow will force the deletion of the inventory levels, even
     * if they have a non-zero stocked quantity. If false, the workflow will
     * not delete the inventory levels if they have a non-zero stocked quantity.
     *
     * Inventory levels that have reserved or incoming items at the location
     * will not be deleted even if the force flag is set to true.
     *
     * @default false
     */
    force?: boolean;
}
/**
 * The result of managing inventory levels in bulk.
 *
 * @property created - The inventory levels that were created.
 * @property updated - The inventory levels that were updated.
 * @property deleted - The IDs of the inventory levels that were deleted.
 */
export interface BatchInventoryItemLevelsWorkflowOutput extends BatchWorkflowOutput<InventoryLevelDTO> {
}
export declare const batchInventoryItemLevelsWorkflowId = "batch-inventory-item-levels-workflow";
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
export declare const batchInventoryItemLevelsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<BatchInventoryItemLevelsWorkflowInput, BatchInventoryItemLevelsWorkflowOutput, []>;
//# sourceMappingURL=batch-inventory-item-levels.d.ts.map