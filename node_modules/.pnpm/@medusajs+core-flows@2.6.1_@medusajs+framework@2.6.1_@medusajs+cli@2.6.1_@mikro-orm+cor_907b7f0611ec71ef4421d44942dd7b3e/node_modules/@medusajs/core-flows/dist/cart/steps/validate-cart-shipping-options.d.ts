import { CartDTO } from "@medusajs/framework/types";
/**
 * The details of the cart and its shipping options context.
 */
export interface ValidateCartShippingOptionsStepInput {
    /**
     * The cart to validate shipping options for.
     */
    cart: CartDTO;
    /**
     * The context to validate the shipping options.
     */
    shippingOptionsContext: {
        /**
         * Validate whether the shipping options are enabled in the store.
         */
        enabled_in_store?: "true" | "false";
        /**
         * Validate whether the shipping options are used for returns.
         */
        is_return?: "true" | "false";
    };
    /**
     * The IDs of the shipping options to validate.
     */
    option_ids: string[];
}
export declare const validateCartShippingOptionsStepId = "validate-cart-shipping-options";
/**
 * This step validates shipping options to ensure they can be applied on a cart.
 * If not valid, the step throws an error.
 *
 * @example
 * const data = validateCartShippingOptionsStep({
 *   // retrieve the details of the cart from another workflow
 *   // or in another step using the Cart Module's service
 *   cart,
 *   option_ids: ["so_123"],
 *   shippingOptionsContext: {}
 * })
 */
export declare const validateCartShippingOptionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateCartShippingOptionsStepInput, undefined>;
//# sourceMappingURL=validate-cart-shipping-options.d.ts.map