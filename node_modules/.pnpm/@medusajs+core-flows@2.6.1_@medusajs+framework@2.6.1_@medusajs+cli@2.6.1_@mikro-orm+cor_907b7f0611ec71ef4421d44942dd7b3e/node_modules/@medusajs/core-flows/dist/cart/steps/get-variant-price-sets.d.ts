import { CalculatedPriceSet } from "@medusajs/framework/types";
/**
 * The details of the variants to get price sets for.
 */
export interface GetVariantPriceSetsStepInput {
    /**
     * The IDs of the variants to get price sets for.
     */
    variantIds: string[];
    /**
     * The context to use when calculating the price sets.
     *
     * Learn more in [this documentation](https://docs.medusajs.com/resources/commerce-modules/product/guides/price#retrieve-calculated-price-for-a-context).
     */
    context?: Record<string, unknown>;
}
/**
 * The calculated price sets of the variants. The object's keys are the variant IDs.
 */
export interface GetVariantPriceSetsStepOutput {
    [k: string]: CalculatedPriceSet;
}
export declare const getVariantPriceSetsStepId = "get-variant-price-sets";
/**
 * This step retrieves the calculated price sets of the specified variants.
 *
 * @example
 * To retrieve a variant's price sets:
 *
 * ```ts
 * const data = getVariantPriceSetsStep({
 *   variantIds: ["variant_123"],
 * })
 * ```
 *
 * To retrieve the calculated price sets of a variant:
 *
 * ```ts
 * const data = getVariantPriceSetsStep({
 *   variantIds: ["variant_123"],
 *   context: {
 *     currency_code: "usd"
 *   }
 * })
 * ```
 */
export declare const getVariantPriceSetsStep: import("@medusajs/framework/workflows-sdk").StepFunction<GetVariantPriceSetsStepInput, {}>;
//# sourceMappingURL=get-variant-price-sets.d.ts.map