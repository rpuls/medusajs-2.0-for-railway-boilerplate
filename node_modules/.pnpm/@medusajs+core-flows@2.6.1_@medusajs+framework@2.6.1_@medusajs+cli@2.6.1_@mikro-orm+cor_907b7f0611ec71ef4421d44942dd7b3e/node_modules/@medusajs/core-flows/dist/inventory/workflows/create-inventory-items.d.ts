import { InventoryTypes } from "@medusajs/framework/types";
/**
 * The inventory level to create.
 */
type LocationLevelWithoutInventory = Omit<InventoryTypes.CreateInventoryLevelInput, "inventory_item_id">;
/**
 * The data to create the inventory items.
 */
export interface CreateInventoryItemsWorkflowInput {
    /**
     * The items to create.
     */
    items: (InventoryTypes.CreateInventoryItemInput & {
        /**
         * The inventory levels of the inventory item.
         */
        location_levels?: LocationLevelWithoutInventory[];
    })[];
}
export declare const createInventoryItemsWorkflowId = "create-inventory-items-workflow";
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
export declare const createInventoryItemsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateInventoryItemsWorkflowInput, InventoryTypes.InventoryItemDTO[], []>;
export {};
//# sourceMappingURL=create-inventory-items.d.ts.map