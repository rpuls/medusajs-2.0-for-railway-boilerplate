import { ListShippingOptionsForCartWithPricingWorkflowInput } from "@medusajs/types";
export declare const listShippingOptionsForCartWithPricingWorkflowId = "list-shipping-options-for-cart-with-pricing";
/**
 * This workflow lists shipping options that can be used during checkout for a cart. It also retrieves the prices
 * of these shipping options, including calculated prices that may be retrieved from third-party providers.
 *
 * This workflow is executed in other cart-related workflows, such as {@link addShippingMethodToCartWorkflow} to retrieve the
 * price of the shipping method being added to the cart.
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to retrieve the shipping options of a cart and their prices
 * in your custom flows.
 *
 * @example
 * const { result } = await listShippingOptionsForCartWithPricingWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     options: [
 *       {
 *         id: "so_123",
 *         data: {
 *           carrier_code: "fedex"
 *         }
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * List a cart's shipping options with prices.
 */
export declare const listShippingOptionsForCartWithPricingWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<ListShippingOptionsForCartWithPricingWorkflowInput, any[], []>;
//# sourceMappingURL=list-shipping-options-for-cart-with-pricing.d.ts.map