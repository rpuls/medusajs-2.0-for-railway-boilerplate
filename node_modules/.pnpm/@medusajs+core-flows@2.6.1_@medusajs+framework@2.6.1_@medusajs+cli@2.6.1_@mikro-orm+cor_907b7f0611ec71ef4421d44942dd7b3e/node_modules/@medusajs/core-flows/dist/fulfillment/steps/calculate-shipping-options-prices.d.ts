import { CalculateShippingOptionPriceDTO } from "@medusajs/framework/types";
/**
 * The data to calculate the prices for one or more shipping options.
 */
export type CalculateShippingOptionsPriceStepInput = CalculateShippingOptionPriceDTO[];
export declare const calculateShippingOptionsPricesStepId = "calculate-shipping-options-prices";
/**
 * This step calculates the prices for one or more shipping options.
 *
 * @example
 * const data = calculateShippingOptionsPricesStep([{
 *   id: "so_123",
 *   provider_id: "provider_123",
 *   optionData: {
 *     // custom data relevant for the fulfillment provider
 *     carrier_code: "UPS",
 *   },
 *   data: {
 *     // custom data relevant for the fulfillment provider
 *     // specific to the cart using this shipping option
 *   },
 *   context: {
 *     from_location: {
 *       id: "sloc_123",
 *       // other location fields
 *     }
 *   }
 * }])
 */
export declare const calculateShippingOptionsPricesStep: import("@medusajs/framework/workflows-sdk").StepFunction<CalculateShippingOptionsPriceStepInput, import("@medusajs/framework/types").CalculatedShippingOptionPrice[]>;
//# sourceMappingURL=calculate-shipping-options-prices.d.ts.map