/**
 * The IDs of the inventory items to validate.
 */
export type ValidateInventoryItemsStepInput = string[];
export declare const validateInventoryItemsId = "validate-inventory-items-step";
/**
 * This step ensures that the inventory items with the specified IDs exist.
 * If not valid, the step will throw an error.
 */
export declare const validateInventoryItems: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateInventoryItemsStepInput, unknown>;
//# sourceMappingURL=validate-inventory-items.d.ts.map