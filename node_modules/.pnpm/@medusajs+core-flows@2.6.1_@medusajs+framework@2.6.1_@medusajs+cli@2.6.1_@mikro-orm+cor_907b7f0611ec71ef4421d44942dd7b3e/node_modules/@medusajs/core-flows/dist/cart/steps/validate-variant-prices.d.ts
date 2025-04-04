import { BigNumberInput } from "@medusajs/framework/types";
/**
 * The details of the variants to validate.
 */
export interface ValidateVariantPricesStepInput {
    /**
     * The variants to validate.
     */
    variants: {
        /**
         * The ID of the variant.
         */
        id: string;
        /**
         * The calculated price of the variant.
         */
        calculated_price?: {
            /**
             * The calculated amount of the price.
             */
            calculated_amount?: BigNumberInput | null;
        };
    }[];
}
export declare const validateVariantPricesStepId = "validate-variant-prices";
/**
 * This step validates the specified variant objects to ensure they have prices.
 * If not valid, the step throws an error.
 *
 * @example
 * const data = validateVariantPricesStep({
 *   variants: [
 *     {
 *       id: "variant_123",
 *     },
 *     {
 *       id: "variant_321",
 *       calculated_price: {
 *         calculated_amount: 10,
 *       }
 *     }
 *   ]
 * })
 */
export declare const validateVariantPricesStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateVariantPricesStepInput, unknown>;
//# sourceMappingURL=validate-variant-prices.d.ts.map