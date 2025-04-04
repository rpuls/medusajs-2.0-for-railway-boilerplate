import { FulfillmentWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate shipping option prices.
 */
export type ValidateShippingOptionPricesStepInput = (FulfillmentWorkflow.CreateShippingOptionsWorkflowInput | FulfillmentWorkflow.UpdateShippingOptionsWorkflowInput)[];
export declare const validateShippingOptionPricesStepId = "validate-shipping-option-prices";
/**
 * This step validates that shipping options can be created based on provided price configuration.
 *
 * For flat rate prices, it validates that regions exist for the shipping option prices.
 * For calculated prices, it validates with the fulfillment provider if the price can be calculated.
 *
 * If not valid, the step throws an error.
 *
 * @example
 * const data = validateShippingOptionPricesStep([
 *   {
 *     name: "Standard Shipping",
 *     service_zone_id: "serzo_123",
 *     shipping_profile_id: "sp_123",
 *     provider_id: "prov_123",
 *     type: {
 *       label: "Standard",
 *       description: "Standard shipping",
 *       code: "standard"
 *     },
 *     price_type: "calculated",
 *   }
 * ])
 */
export declare const validateShippingOptionPricesStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateShippingOptionPricesStepInput, undefined>;
//# sourceMappingURL=validate-shipping-option-prices.d.ts.map