import { PriceDTO, UpdatePriceListPriceWorkflowStepDTO } from "@medusajs/framework/types";
export declare const updatePriceListPricesStepId = "update-price-list-prices";
/**
 * This step updates a price list's prices.
 *
 * @example
 * const data = updatePriceListPricesStep({
 *   data: [{
 *    id: "plist_123",
 *     prices: [
 *       {
 *         id: "price_123",
 *         currency_code: "USD",
 *         amount: 1000,
 *         variant_id: "variant_123",
 *       }
 *     ]
 *   }],
 *   variant_price_map: {
 *     "variant_123": "pset_123"
 *   }
 * })
 */
export declare const updatePriceListPricesStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdatePriceListPriceWorkflowStepDTO, PriceDTO[]>;
//# sourceMappingURL=update-price-list-prices.d.ts.map