/**
 * The configurations to retrieve pricing links for product variants.
 */
export type GetVariantPricingLinkStepInput = {
    /**
     * The IDs of the product variants to retrieve pricing links for.
     */
    ids: string[];
};
export declare const getVariantPricingLinkStepId = "get-variant-pricing-link";
/**
 * This step retrieves links between a product variant and its linked price sets.
 */
export declare const getVariantPricingLinkStep: import("@medusajs/framework/workflows-sdk").StepFunction<GetVariantPricingLinkStepInput, {
    variant_id: string;
    price_set_id: string;
}[]>;
//# sourceMappingURL=get-variant-pricing-link.d.ts.map