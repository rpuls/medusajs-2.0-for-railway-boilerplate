/**
 * The data to set the price sets of a shipping option.
 */
export type SetShippingOptionsPriceSetsStepInput = {
    /**
     * The ID of the shipping option.
     */
    id: string;
    /**
     * The IDs of the price sets of the shipping option.
     */
    price_sets?: string[];
}[];
export declare const setShippingOptionsPriceSetsStepId = "set-shipping-options-price-sets-step";
/**
 * This step sets the price sets of one or more shipping options.
 */
export declare const setShippingOptionsPriceSetsStep: import("@medusajs/framework/workflows-sdk").StepFunction<SetShippingOptionsPriceSetsStepInput, undefined>;
//# sourceMappingURL=set-shipping-options-price-sets.d.ts.map