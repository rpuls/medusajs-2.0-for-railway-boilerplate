import { FilterableInventoryLevelProps, InventoryLevelDTO } from "@medusajs/framework/types";
/**
 * The data to validate the deletion of inventory levels.
 */
export type ValidateInventoryLevelsDeleteStepInput = {
    /**
     * The inventory levels to validate.
     */
    inventoryLevels: InventoryLevelDTO[];
    /**
     * If true, the inventory levels will be deleted even if they have stocked items.
     */
    force?: boolean;
};
/**
 * This step validates that inventory levels are deletable. If the
 * inventory levels have reserved or incoming items, or the force
 * flag is not set and the inventory levels have stocked items, the
 * step will throw an error.
 *
 * :::note
 *
 * You can retrieve an inventory level's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = validateInventoryLevelsDelete({
 *   inventoryLevels: [
 *     {
 *       id: "iilev_123",
 *       // other inventory level details...
 *     }
 *   ]
 * })
 */
export declare const validateInventoryLevelsDelete: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateInventoryLevelsDeleteStepInput, unknown>;
/**
 * The data to delete inventory levels. The inventory levels to be deleted
 * are selected based on the filters that you specify.
 */
export interface DeleteInventoryLevelsWorkflowInput extends FilterableInventoryLevelProps {
    /**
     * If true, the inventory levels will be deleted even if they have stocked items.
     */
    force?: boolean;
}
export declare const deleteInventoryLevelsWorkflowId = "delete-inventory-levels-workflow";
/**
 * This workflow deletes one or more inventory levels. It's used by the
 * [Delete Inventory Levels Admin API Route](https://docs.medusajs.com/api/admin#inventory-items_deleteinventoryitemsidlocationlevelslocation_id).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete inventory levels in your custom flows.
 *
 * @example
 * const { result } = await deleteInventoryLevelsWorkflow(container)
 * .run({
 *   input: {
 *     id: ["iilev_123", "iilev_321"],
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more inventory levels.
 */
export declare const deleteInventoryLevelsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteInventoryLevelsWorkflowInput, undefined, []>;
//# sourceMappingURL=delete-inventory-levels.d.ts.map