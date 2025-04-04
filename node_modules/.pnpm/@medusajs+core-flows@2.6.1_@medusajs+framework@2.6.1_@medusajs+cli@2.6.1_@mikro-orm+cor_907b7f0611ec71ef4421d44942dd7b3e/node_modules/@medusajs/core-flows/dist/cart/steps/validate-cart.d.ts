import { CartDTO, CartWorkflowDTO } from "@medusajs/framework/types";
/**
 * The details of the cart to validate.
 */
export interface ValidateCartStepInput {
    /**
     * The cart to validate.
     */
    cart: CartWorkflowDTO | CartDTO;
}
export declare const validateCartStepId = "validate-cart";
/**
 * This step validates a cart to ensure it exists and is not completed.
 * If not valid, the step throws an error.
 *
 * :::tip
 *
 * You can use the {@link retrieveCartStep} to retrieve a cart's details.
 *
 * :::
 *
 * @example
 * const data = validateCartStep({
 *   // retrieve the details of the cart from another workflow
 *   // or in another step using the Cart Module's service
 *   cart,
 * })
 */
export declare const validateCartStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateCartStepInput, unknown>;
//# sourceMappingURL=validate-cart.d.ts.map