/**
 * The details of the line item adjustments to remove.
 */
export interface RemoveLineItemAdjustmentsStepInput {
    /**
     * The IDs of the line item adjustments to remove.
     */
    lineItemAdjustmentIdsToRemove: string[];
}
export declare const removeLineItemAdjustmentsStepId = "remove-line-item-adjustments";
/**
 * This step removes line item adjustments from a cart.
 */
export declare const removeLineItemAdjustmentsStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemoveLineItemAdjustmentsStepInput, undefined>;
//# sourceMappingURL=remove-line-item-adjustments.d.ts.map