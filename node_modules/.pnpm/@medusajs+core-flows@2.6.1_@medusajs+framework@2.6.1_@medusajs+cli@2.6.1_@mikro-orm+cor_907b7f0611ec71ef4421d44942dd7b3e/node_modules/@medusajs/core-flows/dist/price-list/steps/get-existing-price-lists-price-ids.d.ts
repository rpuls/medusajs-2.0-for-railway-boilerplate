/**
 * The data to retrieve the prices of price lists.
 */
export type GetExistingPriceListsPriceIdsStepInput = {
    /**
     * The IDs of the price lists to retrieve the prices for.
     */
    price_list_ids: string[];
};
/**
 * An object whose keys are price list IDs and values are arrays of its price IDs.
 */
export type GetExistingPriceListsPriceIdsStepOutput = Record<string, string[]>;
export declare const getExistingPriceListsPriceIdsStepId = "get-existing-price-lists-prices";
/**
 * This step retrieves prices of price lists.
 */
export declare const getExistingPriceListsPriceIdsStep: import("@medusajs/framework/workflows-sdk").StepFunction<GetExistingPriceListsPriceIdsStepInput, GetExistingPriceListsPriceIdsStepOutput>;
//# sourceMappingURL=get-existing-price-lists-price-ids.d.ts.map