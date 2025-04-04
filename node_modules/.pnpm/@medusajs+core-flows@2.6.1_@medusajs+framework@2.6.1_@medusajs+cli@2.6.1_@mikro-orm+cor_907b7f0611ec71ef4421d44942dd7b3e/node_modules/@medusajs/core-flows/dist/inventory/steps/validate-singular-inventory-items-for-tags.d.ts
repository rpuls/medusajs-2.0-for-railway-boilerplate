/**
 * The data to validate inventory items for creation.
 */
export type ValidateInventoryItemsForCreateStepInput = {
    /**
     * The ID of the variant to validate.
     */
    tag?: string;
}[];
export declare const validateInventoryItemsForCreateStepId = "validate-inventory-items-for-create-step";
/**
 * This step checks whether a variant already has an inventory item.
 * If so, the step will throw an error.
 *
 * @example
 * const data = validateInventoryItemsForCreate([
 *   {
 *     tag: "variant_123"
 *   }
 * ])
 */
export declare const validateInventoryItemsForCreate: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateInventoryItemsForCreateStepInput, ValidateInventoryItemsForCreateStepInput>;
//# sourceMappingURL=validate-singular-inventory-items-for-tags.d.ts.map