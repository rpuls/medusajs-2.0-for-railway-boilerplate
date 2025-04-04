import { ComputeActions } from "@medusajs/framework/types";
/**
 * The details of the actions computed by the Promotion Module.
 */
export interface PrepareAdjustmentsFromPromotionActionsStepInput {
    /**
     * The actions computed by the Promotion Module.
     */
    actions: ComputeActions[];
}
/**
 * The details of the adjustments to create and remove.
 */
export interface PrepareAdjustmentsFromPromotionActionsStepOutput {
    /**
     * The line item adjustments to create.
     */
    lineItemAdjustmentsToCreate: {
        /**
         * The promotion code that computed the adjustment.
         */
        code: string;
        /**
         * The amount of the adjustment.
         */
        amount: number;
        /**
         * The ID of the line item to adjust.
         */
        item_id: string;
        /**
         * The ID of the applied promotion.
         */
        promotion_id?: string;
    }[];
    /**
     * The line item adjustment IDs to remove.
     */
    lineItemAdjustmentIdsToRemove: string[];
    /**
     * The shipping method adjustments to create.
     */
    shippingMethodAdjustmentsToCreate: {
        /**
         * The promotion code that computed the adjustment.
         */
        code: string;
        /**
         * The amount of the adjustment.
         */
        amount: number;
        /**
         * The ID of the shipping method to adjust.
         */
        shipping_method_id: string;
        /**
         * The ID of the applied promotion.
         */
        promotion_id?: string;
    }[];
    /**
     * The shipping method adjustment IDs to remove.
     */
    shippingMethodAdjustmentIdsToRemove: string[];
    /**
     * The promotion codes that were computed.
     */
    computedPromotionCodes: string[];
}
export declare const prepareAdjustmentsFromPromotionActionsStepId = "prepare-adjustments-from-promotion-actions";
/**
 * This step prepares the line item or shipping method adjustments using
 * actions computed by the Promotion Module.
 *
 * @example
 * const data = prepareAdjustmentsFromPromotionActionsStep({
 *   "actions": [{
 *     "action": "addItemAdjustment",
 *     "item_id": "litem_123",
 *     "amount": 10,
 *     "code": "10OFF",
 *   }]
 * })
 */
export declare const prepareAdjustmentsFromPromotionActionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<PrepareAdjustmentsFromPromotionActionsStepInput, PrepareAdjustmentsFromPromotionActionsStepOutput>;
//# sourceMappingURL=prepare-adjustments-from-promotion-actions.d.ts.map