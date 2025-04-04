/**
 * The details of the shipping method adjustments to remove.
 */
export interface RemoveShippingMethodAdjustmentsStepInput {
    /**
     * The IDs of the shipping method adjustments to remove.
     */
    shippingMethodAdjustmentIdsToRemove: string[];
}
export declare const removeShippingMethodAdjustmentsStepId = "remove-shipping-method-adjustments";
/**
 * This step removes shipping method adjustments from a cart.
 */
export declare const removeShippingMethodAdjustmentsStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemoveShippingMethodAdjustmentsStepInput, undefined>;
//# sourceMappingURL=remove-shipping-method-adjustments.d.ts.map