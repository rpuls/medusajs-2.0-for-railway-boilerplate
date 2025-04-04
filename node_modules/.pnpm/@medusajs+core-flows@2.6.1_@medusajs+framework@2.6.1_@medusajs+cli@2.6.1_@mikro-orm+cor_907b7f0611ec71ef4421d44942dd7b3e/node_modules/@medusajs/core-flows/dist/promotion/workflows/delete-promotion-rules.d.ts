import { RemovePromotionRulesWorkflowDTO } from "@medusajs/framework/types";
export declare const deletePromotionRulesWorkflowId = "delete-promotion-rules-workflow";
/**
 * This workflow deletes one or more promotion rules. It's used by other workflows,
 * such as {@link batchPromotionRulesWorkflow} that manages the rules of a promotion.
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * delete promotion rules within your custom flows.
 *
 * @example
 * const { result } = await deletePromotionRulesWorkflow(container)
 * .run({
 *   input: {
 *     rule_type: RuleType.RULES,
 *     data: {
 *       id: "promo_123",
 *       rule_ids: ["prule_123"]
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more promotion rules.
 */
export declare const deletePromotionRulesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<RemovePromotionRulesWorkflowDTO, unknown, any[]>;
//# sourceMappingURL=delete-promotion-rules.d.ts.map