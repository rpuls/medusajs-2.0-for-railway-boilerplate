import { InventoryTypes } from "@medusajs/framework/types";
/**
 * The data to adjust the inventory levels.
 */
export type AdjustInventoryLevelsStepInput = InventoryTypes.BulkAdjustInventoryLevelInput[];
export declare const adjustInventoryLevelsStepId = "adjust-inventory-levels-step";
/**
 * This step adjusts the stocked quantity of one or more inventory levels. You can
 * pass a positive value in `adjustment` to add to the stocked quantity, or a negative value to
 * subtract from the stocked quantity.
 *
 * @example
 * const data = adjustInventoryLevelsStep([
 *   {
 *     inventory_item_id: "iitem_123",
 *     location_id: "sloc_123",
 *     adjustment: 10,
 *   }
 * ])
 */
export declare const adjustInventoryLevelsStep: import("@medusajs/framework/workflows-sdk").StepFunction<AdjustInventoryLevelsStepInput, InventoryTypes.InventoryLevelDTO[]>;
//# sourceMappingURL=adjust-inventory-levels.d.ts.map