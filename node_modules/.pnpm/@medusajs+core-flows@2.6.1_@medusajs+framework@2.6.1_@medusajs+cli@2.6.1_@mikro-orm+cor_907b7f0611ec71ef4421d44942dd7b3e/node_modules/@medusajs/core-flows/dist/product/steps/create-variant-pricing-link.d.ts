/**
 * The links to create between variant and price set records.
 */
export type CreateVariantPricingLinkStepInput = {
    /**
     * The variant and price set record IDs to link.
     */
    links: {
        /**
         * The variant's ID.
         */
        variant_id: string;
        /**
         * The price set's ID.
         */
        price_set_id: string;
    }[];
};
export declare const createVariantPricingLinkStepId = "create-variant-pricing-link";
/**
 * This step creates links between variant and price set records.
 *
 * @example
 * const data = createVariantPricingLinkStep({
 *   links: [
 *     {
 *       variant_id: "variant_123",
 *       price_set_id: "pset_123"
 *     }
 *   ]
 * })
 */
export declare const createVariantPricingLinkStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateVariantPricingLinkStepInput, undefined>;
//# sourceMappingURL=create-variant-pricing-link.d.ts.map