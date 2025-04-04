import { PricingTypes, UpdatePriceListPricesWorkflowDTO } from "@medusajs/framework/types";
/**
 * The data to update the prices of price lists.
 */
export type UpdatePriceListPricesWorkflowInput = {
    /**
     * The price lists to update their prices.
     */
    data: UpdatePriceListPricesWorkflowDTO[];
};
export declare const updatePriceListPricesWorkflowId = "update-price-list-prices";
/**
 * This workflow update price lists' prices. It's used by other workflows, such
 * as {@link batchPriceListPricesWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update prices in price lists in your custom flows.
 *
 * @example
 * const { result } = await updatePriceListPricesWorkflow(container)
 * .run({
 *   input: {
 *     data: [
 *       {
 *         id: "price_123",
 *         prices: [
 *           {
 *             id: "price_123",
 *             amount: 10,
 *             currency_code: "usd",
 *             variant_id: "variant_123"
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Update price lists' prices.
 */
export declare const updatePriceListPricesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpdatePriceListPricesWorkflowInput, PricingTypes.PriceDTO[], []>;
//# sourceMappingURL=update-price-list-prices.d.ts.map