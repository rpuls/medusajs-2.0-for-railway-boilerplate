import { AddPromotionRulesWorkflowDTO } from "@medusajs/framework/types";
export declare const addRulesToPromotionsStepId = "add-rules-to-promotions";
/**
 * This step adds rules to a promotion.
 *
 * @example
 * const data = addRulesToPromotionsStep({
 *   // import { RuleType } from "@medusajs/framework/utils"
 *   rule_type: RuleType.RULES,
 *   data: {
 *     id: "promo_123",
 *     rules: [
 *       {
 *         attribute: "customer_group",
 *         operator: "eq",
 *         values: "custgrp_123"
 *       }
 *     ]
 *   }
 * })
 */
export declare const addRulesToPromotionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<AddPromotionRulesWorkflowDTO, import("@medusajs/framework/types").PromotionRuleDTO[]>;
//# sourceMappingURL=add-rules-to-promotions.d.ts.map