/**
 * The IDs of the inventory items to delete.
 */
export type DeleteInventoryItemWorkflowInput = string[];
/**
 * The IDs of deleted inventory items.
 */
export type DeleteInventoryItemWorkflowOutput = string[];
export declare const deleteInventoryItemWorkflowId = "delete-inventory-item-workflow";
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
export declare const deleteInventoryItemWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteInventoryItemWorkflowInput, DeleteInventoryItemWorkflowOutput, []>;
//# sourceMappingURL=delete-inventory-items.d.ts.map