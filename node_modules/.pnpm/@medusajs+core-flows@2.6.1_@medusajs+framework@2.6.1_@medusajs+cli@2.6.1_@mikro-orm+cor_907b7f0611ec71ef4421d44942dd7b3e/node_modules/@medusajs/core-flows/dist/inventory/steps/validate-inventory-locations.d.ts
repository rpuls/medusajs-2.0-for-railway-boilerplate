import { InventoryTypes } from "@medusajs/framework/types";
/**
 * The data to validate the inventory levels.
 */
export type ValidateInventoryLocationsStepInput = InventoryTypes.CreateInventoryLevelInput[];
export declare const validateInventoryLocationsStepId = "validate-inventory-levels-step";
/**
 * This step ensures that the inventory levels exist for each
 * specified pair of inventory item and location. If not,
 * the step will throw an error.
 */
export declare const validateInventoryLocationsStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateInventoryLocationsStepInput, unknown>;
//# sourceMappingURL=validate-inventory-locations.d.ts.map