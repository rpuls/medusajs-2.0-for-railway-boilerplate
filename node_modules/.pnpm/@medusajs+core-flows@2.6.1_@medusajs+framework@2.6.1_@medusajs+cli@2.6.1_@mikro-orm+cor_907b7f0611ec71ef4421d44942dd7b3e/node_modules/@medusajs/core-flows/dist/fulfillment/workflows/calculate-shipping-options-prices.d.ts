import { FulfillmentWorkflow } from "@medusajs/framework/types";
export declare const calculateShippingOptionsPricesWorkflowId = "calculate-shipping-options-prices-workflow";
/**
 * This workflow calculates the prices for one or more shipping options in a cart. It's used by the
 * [Calculate Shipping Option Price Store API Route](https://docs.medusajs.com/api/store#shipping-options_postshippingoptionsidcalculate).
 *
 * :::note
 *
 * Calculating shipping option prices may require sending requests to third-party fulfillment services.
 * This depends on the implementation of the fulfillment provider associated with the shipping option.
 *
 * :::
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * calculate the prices of shipping options within your custom flows.
 *
 * @example
 * const { result } = await calculateShippingOptionsPricesWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     shipping_options: [
 *       {
 *         id: "so_123",
 *         data: {
 *           // custom data relevant for the fulfillment provider
 *           carrier_code: "ups",
 *         }
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Calculate shipping option prices in a cart.
 */
export declare const calculateShippingOptionsPricesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<FulfillmentWorkflow.CalculateShippingOptionsPricesWorkflowInput, FulfillmentWorkflow.CalculateShippingOptionsPricesWorkflowOutput, []>;
//# sourceMappingURL=calculate-shipping-options-prices.d.ts.map