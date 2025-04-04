import { InventoryTypes } from "@medusajs/framework/types";
/**
 * The data to update the inventory levels.
 */
export type UpdateInventoryLevelsStepInput = InventoryTypes.UpdateInventoryLevelInput[];
export declare const updateInventoryLevelsStepId = "update-inventory-levels-step";
/**
 * This step updates one or more inventory levels.
 */
export declare const updateInventoryLevelsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateInventoryLevelsStepInput, InventoryTypes.InventoryLevelDTO[]>;
//# sourceMappingURL=update-inventory-levels.d.ts.map