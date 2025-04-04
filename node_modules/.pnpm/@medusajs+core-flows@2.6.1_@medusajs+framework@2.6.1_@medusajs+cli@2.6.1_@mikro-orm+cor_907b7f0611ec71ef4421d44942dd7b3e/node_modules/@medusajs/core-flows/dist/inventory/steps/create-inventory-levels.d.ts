import { InventoryTypes } from "@medusajs/framework/types";
/**
 * The data to create the inventory levels.
 */
export type CreateInventoryLevelsStepInput = InventoryTypes.CreateInventoryLevelInput[];
export declare const createInventoryLevelsStepId = "create-inventory-levels";
/**
 * This step creates one or more inventory levels.
 */
export declare const createInventoryLevelsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateInventoryLevelsStepInput, InventoryTypes.InventoryLevelDTO[]>;
//# sourceMappingURL=create-inventory-levels.d.ts.map