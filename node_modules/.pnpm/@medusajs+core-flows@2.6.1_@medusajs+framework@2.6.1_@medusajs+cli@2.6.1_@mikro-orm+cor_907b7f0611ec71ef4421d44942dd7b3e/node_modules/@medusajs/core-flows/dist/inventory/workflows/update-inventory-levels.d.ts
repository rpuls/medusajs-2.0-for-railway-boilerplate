import { InventoryLevelDTO, InventoryTypes } from "@medusajs/framework/types";
/**
 * The data to update the inventory levels.
 */
export interface UpdateInventoryLevelsWorkflowInput {
    /**
     * The inventory levels to update.
     */
    updates: InventoryTypes.UpdateInventoryLevelInput[];
}
/**
 * The updated inventory levels.
 */
export type UpdateInventoryLevelsWorkflowOutput = InventoryLevelDTO[];
export declare const updateInventoryLevelsWorkflowId = "update-inventory-levels-workflow";
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
export declare const updateInventoryLevelsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpdateInventoryLevelsWorkflowInput, UpdateInventoryLevelsWorkflowOutput, []>;
//# sourceMappingURL=update-inventory-levels.d.ts.map