import { CreatePriceListPricesWorkflowStepDTO } from "@medusajs/framework/types";
export declare const createPriceListPricesStepId = "create-price-list-prices";
/**
 * This step creates prices for a price list.
 *
 * @example
 * const data = createPriceListPricesStep({
 *   data: [{
 *     id: "plist_123",
 *     prices: [
 *       {
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
export declare const createPriceListPricesStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreatePriceListPricesWorkflowStepDTO, import("@medusajs/framework/types").PriceDTO[]>;
//# sourceMappingURL=create-price-list-prices.d.ts.map