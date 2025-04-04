import { CreateShippingMethodAdjustmentDTO } from "@medusajs/framework/types";
/**
 * The details of the shipping method adjustments to create.
 */
export interface CreateShippingMethodAdjustmentsStepInput {
    /**
     * The shipping method adjustments to create.
     */
    shippingMethodAdjustmentsToCreate: CreateShippingMethodAdjustmentDTO[];
}
export declare const createShippingMethodAdjustmentsStepId = "create-shipping-method-adjustments";
/**
 * This step creates shipping method adjustments for a cart.
 *
 * @example
 * const data = createShippingMethodAdjustmentsStep({
 *   "shippingMethodAdjustmentsToCreate": [{
 *     "shipping_method_id": "sm_123",
 *     "code": "10OFF",
 *     "amount": 10
 *   }]
 * })
 */
export declare const createShippingMethodAdjustmentsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateShippingMethodAdjustmentsStepInput, undefined>;
//# sourceMappingURL=create-shipping-method-adjustments.d.ts.map