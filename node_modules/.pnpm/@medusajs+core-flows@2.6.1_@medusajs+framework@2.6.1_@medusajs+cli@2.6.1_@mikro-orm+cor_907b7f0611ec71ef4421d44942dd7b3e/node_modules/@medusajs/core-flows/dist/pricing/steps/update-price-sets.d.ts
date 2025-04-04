import { PricingTypes } from "@medusajs/framework/types";
/**
 * The data to update price sets. You can either update price sets with a selector
 * or by providing IDs in the price set objects to update.
 */
export type UpdatePriceSetsStepInput = {
    /**
     * The filters to select which price sets to update.
     */
    selector?: PricingTypes.FilterablePriceSetProps;
    /**
     * The data to update the price sets with.
     */
    update?: PricingTypes.UpdatePriceSetDTO;
} | {
    /**
     * The price sets to update.
     */
    price_sets: PricingTypes.UpsertPriceSetDTO[];
};
export declare const updatePriceSetsStepId = "update-price-sets";
/**
 * This step updates price sets.
 *
 * @example
 * const data = updatePriceSetsStep({
 *   selector: {
 *     id: ["pset_123"]
 *   },
 *   update: {
 *     prices: [
 *       {
 *         amount: 10,
 *         currency_code: "usd",
 *       }
 *     ]
 *   }
 * })
 */
export declare const updatePriceSetsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdatePriceSetsStepInput, PricingTypes.PriceSetDTO[]>;
//# sourceMappingURL=update-price-sets.d.ts.map