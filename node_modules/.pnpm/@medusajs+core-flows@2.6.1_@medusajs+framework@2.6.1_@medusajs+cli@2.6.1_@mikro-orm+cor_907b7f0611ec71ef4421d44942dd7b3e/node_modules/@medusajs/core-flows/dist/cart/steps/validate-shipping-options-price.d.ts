/**
 * The details of the shipping options to validate.
 */
export type ValidateCartShippingOptionsPriceInput = {
    /**
     * The shipping option's details. Should have a `calculated_price.calculated_amount`
     * to be considered valid.
     */
    shippingOptions: any[];
};
export declare const validateCartShippingOptionsPriceStepId = "validate-cart-shipping-options";
/**
 * This step validates shipping options to ensure they have a price.
 * If not valid, the step throws an error.
 *
 * @example
 * const data = validateCartShippingOptionsPriceStep({
 *   shippingOptions: [
 *     {
 *       id: "so_123",
 *     },
 *     {
 *       id: "so_321",
 *       calculated_price: {
 *         calculated_amount: 10,
 *       }
 *     }
 *   ]
 * })
 */
export declare const validateCartShippingOptionsPriceStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateCartShippingOptionsPriceInput, undefined>;
//# sourceMappingURL=validate-shipping-options-price.d.ts.map