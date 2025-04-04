import { InventoryTypes } from "@medusajs/framework/types";
/**
 * The data to create the inventory items.
 */
export type CreateInventoryItemsStepInput = InventoryTypes.CreateInventoryItemInput[];
export declare const createInventoryItemsStepId = "create-inventory-items";
/**
 * This step creates one or more inventory items.
 */
export declare const createInventoryItemsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateInventoryItemsStepInput, InventoryTypes.InventoryItemDTO[]>;
//# sourceMappingURL=create-inventory-items.d.ts.map