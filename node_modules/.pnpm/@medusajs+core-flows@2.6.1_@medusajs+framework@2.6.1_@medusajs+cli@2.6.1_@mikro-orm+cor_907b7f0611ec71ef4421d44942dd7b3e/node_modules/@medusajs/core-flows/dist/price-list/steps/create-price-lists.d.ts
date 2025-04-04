import { CreatePriceListsWorkflowStepDTO } from "@medusajs/framework/types";
export declare const createPriceListsStepId = "create-price-lists";
/**
 * This step creates a price list.
 *
 * @example
 * const data = createPriceListsStep({
 *   data: [{
 *     title: "Test Price List",
 *     description: "Test Price List",
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
export declare const createPriceListsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreatePriceListsWorkflowStepDTO, import("@medusajs/framework/types").PriceListDTO[]>;
//# sourceMappingURL=create-price-lists.d.ts.map