import { InventoryTypes } from "@medusajs/framework/types";
/**
 * The data to update the inventory items.
 */
export type UpdateInventoryItemsStepInput = InventoryTypes.UpdateInventoryItemInput[];
export declare const updateInventoryItemsStepId = "update-inventory-items-step";
/**
 * This step updates one or more inventory items.
 */
export declare const updateInventoryItemsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateInventoryItemsStepInput, InventoryTypes.InventoryItemDTO[]>;
//# sourceMappingURL=update-inventory-items.d.ts.map