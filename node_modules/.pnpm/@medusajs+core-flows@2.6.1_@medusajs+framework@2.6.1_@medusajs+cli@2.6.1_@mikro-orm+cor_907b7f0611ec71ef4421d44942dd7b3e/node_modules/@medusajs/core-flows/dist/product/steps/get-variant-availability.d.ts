/**
 * The details required to compute the inventory availability for a list of variants in a given sales channel.
 */
export type GetVariantAvailabilityStepInput = {
    /**
     * The IDs of the variants to retrieve their availability.
     */
    variant_ids: string[];
    /**
     * The ID of the sales channel to retrieve the variant availability in.
     */
    sales_channel_id: string;
};
export declare const getVariantAvailabilityId = "get-variant-availability";
/**
 * This step computes the inventory availability for a list of variants in a given sales channel.
 *
 * @example
 * const data = getVariantAvailabilityStep({
 *   variant_ids: ["variant_123"],
 *   sales_channel_id: "sc_123"
 * })
 */
export declare const getVariantAvailabilityStep: import("@medusajs/framework/workflows-sdk").StepFunction<GetVariantAvailabilityStepInput, import("@medusajs/framework/utils").VariantAvailabilityResult>;
//# sourceMappingURL=get-variant-availability.d.ts.map