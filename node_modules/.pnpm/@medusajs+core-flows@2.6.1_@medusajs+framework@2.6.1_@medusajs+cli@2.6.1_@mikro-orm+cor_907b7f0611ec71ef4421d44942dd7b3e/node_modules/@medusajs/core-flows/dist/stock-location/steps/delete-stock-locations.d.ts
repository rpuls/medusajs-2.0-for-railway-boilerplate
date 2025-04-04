import { DeleteEntityInput } from "@medusajs/framework/modules-sdk";
/**
 * The IDs of stock locations to delete.
 */
export type DeleteStockLocationsStepInput = string[];
export declare const deleteStockLocationsStepId = "delete-stock-locations-step";
/**
 * This step deletes one or more stock locations.
 */
export declare const deleteStockLocationsStep: import("@medusajs/framework/workflows-sdk").StepFunction<DeleteStockLocationsStepInput, DeleteEntityInput>;
//# sourceMappingURL=delete-stock-locations.d.ts.map