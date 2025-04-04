import { FulfillmentWorkflow } from "@medusajs/framework/types";
/**
 * The data to set the prices of a shipping option.
 */
export type SetShippingOptionsPricesStepInput = {
    /**
     * The ID of the shipping option.
     */
    id: string;
    /**
     * The prices of the shipping option.
     */
    prices?: FulfillmentWorkflow.UpdateShippingOptionPriceRecord[];
}[];
export declare const setShippingOptionsPricesStepId = "set-shipping-options-prices-step";
/**
 * This step sets the prices of one or more shipping options.
 *
 * @example
 * const data = setShippingOptionsPricesStep([
 *   {
 *     id: "so_123",
 *     prices: [
 *       {
 *         amount: 1000,
 *         currency_code: "usd",
 *       }
 *     ]
 *   }
 * ])
 */
export declare const setShippingOptionsPricesStep: import("@medusajs/framework/workflows-sdk").StepFunction<SetShippingOptionsPricesStepInput, undefined>;
//# sourceMappingURL=set-shipping-options-prices.d.ts.map