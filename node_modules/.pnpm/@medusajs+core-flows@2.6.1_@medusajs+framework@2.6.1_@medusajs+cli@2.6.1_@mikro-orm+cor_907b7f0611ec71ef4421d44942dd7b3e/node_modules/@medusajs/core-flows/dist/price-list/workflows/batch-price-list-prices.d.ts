import { BatchPriceListPricesWorkflowDTO, BatchPriceListPricesWorkflowResult } from "@medusajs/framework/types";
/**
 * The data to manage a price list's prices.
 */
export type BatchPriceListPricesWorkflowInput = {
    /**
     * The data to manage the prices of a price list.
     */
    data: BatchPriceListPricesWorkflowDTO;
};
export declare const batchPriceListPricesWorkflowId = "batch-price-list-prices";
/**
 * This workflow manages a price list's prices by creating, updating, or removing them. It's used by the
 * [Manage Prices in Price List Admin API Route](https://docs.medusajs.com/api/admin#price-lists_postpricelistsidpricesbatch).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * manage price lists' prices in your custom flows.
 *
 * @example
 * const { result } = await batchPriceListPricesWorkflow(container)
 * .run({
 *   input: {
 *     data: {
 *       id: "plist_123",
 *       create: [
 *         {
 *           amount: 10,
 *           currency_code: "usd",
 *           variant_id: "variant_123"
 *         }
 *       ],
 *       update: [
 *         {
 *           id: "price_123",
 *           amount: 10,
 *           currency_code: "usd",
 *           variant_id: "variant_123"
 *         }
 *       ],
 *       delete: ["price_321"]
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Manage a price list's prices.
 */
export declare const batchPriceListPricesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<BatchPriceListPricesWorkflowInput, BatchPriceListPricesWorkflowResult, []>;
//# sourceMappingURL=batch-price-list-prices.d.ts.map