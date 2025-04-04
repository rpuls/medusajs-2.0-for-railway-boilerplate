/**
 * The data to remove prices from price lists.
 */
export type RemovePriceListPricesWorkflowInput = {
    /**
     * The IDs of the price lists to remove their prices.
     */
    ids: string[];
};
export declare const removePriceListPricesWorkflowId = "remove-price-list-prices";
/**
 * This workflow removes price lists' prices. It's used by other workflows, such
 * as {@link batchPriceListPricesWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * remove prices in price lists in your custom flows.
 *
 * @example
 * const { result } = await removePriceListPricesWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["plist_123"]
 *   }
 * })
 *
 * @summary
 *
 * Remove prices in price lists.
 */
export declare const removePriceListPricesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<RemovePriceListPricesWorkflowInput, string[], []>;
//# sourceMappingURL=remove-price-list-prices.d.ts.map