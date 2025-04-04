import { UpdateFulfillmentShippingOptionRulesWorkflowDTO } from "@medusajs/framework/types";
export declare const updateShippingOptionRulesStepId = "update-shipping-option-rules";
/**
 * This step updates one or more shipping option rules.
 *
 * @example
 * const data = updateShippingOptionRulesStep({
 *   data: [
 *     {
 *       id: "sor_123",
 *       operator: "in"
 *     }
 *   ]
 * })
 */
export declare const updateShippingOptionRulesStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateFulfillmentShippingOptionRulesWorkflowDTO, import("@medusajs/framework/types").ShippingOptionRuleDTO[]>;
//# sourceMappingURL=update-shipping-option-rules.d.ts.map