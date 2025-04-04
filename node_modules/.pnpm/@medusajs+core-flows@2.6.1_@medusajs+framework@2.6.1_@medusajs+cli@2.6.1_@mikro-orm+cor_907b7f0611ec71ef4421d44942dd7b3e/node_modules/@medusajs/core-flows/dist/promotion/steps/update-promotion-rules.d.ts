import { UpdatePromotionRulesWorkflowDTO } from "@medusajs/framework/types";
export declare const updatePromotionRulesStepId = "update-promotion-rules";
/**
 * This step updates one or more promotion rules.
 *
 * @example
 * const data = updatePromotionRulesStep({
 *   data: [
 *     {
 *       id: "prule_123",
 *       attribute: "customer_group"
 *     }
 *   ]
 * })
 */
export declare const updatePromotionRulesStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdatePromotionRulesWorkflowDTO, import("@medusajs/framework/types").PromotionRuleDTO[]>;
//# sourceMappingURL=update-promotion-rules.d.ts.map