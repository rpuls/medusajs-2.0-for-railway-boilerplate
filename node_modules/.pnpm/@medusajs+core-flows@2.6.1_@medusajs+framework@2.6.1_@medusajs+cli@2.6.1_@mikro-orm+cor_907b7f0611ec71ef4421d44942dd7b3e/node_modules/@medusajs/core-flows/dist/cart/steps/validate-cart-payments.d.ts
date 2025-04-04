import { CartWorkflowDTO } from "@medusajs/framework/types";
/**
 * The cart's details.
 */
export interface ValidateCartPaymentsStepInput {
    /**
     * The cart to validate payment sessions for.
     */
    cart: CartWorkflowDTO;
}
export declare const validateCartPaymentsStepId = "validate-cart-payments";
/**
 * This step validates a cart's payment sessions. Their status must
 * be `pending` or `requires_more`. If not valid, the step throws an error.
 *
 * :::tip
 *
 * You can use the {@link retrieveCartStep} to retrieve a cart's details.
 *
 * :::
 *
 * @example
 * const data = validateCartPaymentsStep({
 *   // retrieve the details of the cart from another workflow
 *   // or in another step using the Cart Module's service
 *   cart
 * })
 */
export declare const validateCartPaymentsStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateCartPaymentsStepInput, import("@medusajs/framework/types").PaymentSessionDTO[]>;
//# sourceMappingURL=validate-cart-payments.d.ts.map