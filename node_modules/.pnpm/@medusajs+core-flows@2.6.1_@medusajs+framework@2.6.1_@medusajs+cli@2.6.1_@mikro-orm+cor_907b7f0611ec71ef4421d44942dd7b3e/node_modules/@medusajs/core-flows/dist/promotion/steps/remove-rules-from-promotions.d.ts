import { RemovePromotionRulesWorkflowDTO } from "@medusajs/framework/types";
export declare const removeRulesFromPromotionsStepId = "remove-rules-from-promotions";
/**
 * This step removes rules from a promotion.
 *
 * @example
 * const data = removeRulesFromPromotionsStep({
 *   rule_type: RuleType.RULES,
 *   data: {
 *     id: "promo_123",
 *     rule_ids: ["prule_123"]
 *   }
 * })
 */
export declare const removeRulesFromPromotionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemovePromotionRulesWorkflowDTO, null>;
//# sourceMappingURL=remove-rules-from-promotions.d.ts.map