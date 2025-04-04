/**
 * The data to set the payment providers available in regions.
 */
export interface SetRegionsPaymentProvidersStepInput {
    /**
     * The regions to set the payment providers for.
     */
    input: {
        /**
         * The ID of the region.
         */
        id: string;
        /**
         * The IDs of the payment providers that are available in the region.
         */
        payment_providers?: string[];
    }[];
}
export declare const setRegionsPaymentProvidersStepId = "add-region-payment-providers-step";
/**
 * This step sets the payment providers available in regions.
 *
 * @example
 * const data = setRegionsPaymentProvidersStep({
 *   input: [
 *     {
 *       id: "reg_123",
 *       payment_providers: ["pp_system", "pp_stripe_stripe"]
 *     }
 *   ]
 * })
 */
export declare const setRegionsPaymentProvidersStep: import("@medusajs/framework/workflows-sdk").StepFunction<SetRegionsPaymentProvidersStepInput, undefined>;
//# sourceMappingURL=set-regions-payment-providers.d.ts.map