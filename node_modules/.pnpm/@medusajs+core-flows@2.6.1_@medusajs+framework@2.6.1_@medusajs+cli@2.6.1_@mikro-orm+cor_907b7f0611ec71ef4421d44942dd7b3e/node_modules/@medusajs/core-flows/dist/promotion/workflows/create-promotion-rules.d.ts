import { AddPromotionRulesWorkflowDTO, PromotionRuleDTO } from "@medusajs/framework/types";
export declare const createPromotionRulesWorkflowId = "create-promotion-rules-workflow";
/**
 * This workflow creates one or more promotion rules. It's used by other workflows,
 * such as {@link batchPromotionRulesWorkflow} that manages the rules of a promotion.
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * create promotion rules within your custom flows.
 *
 * @example
 * const { result } = await createPromotionRulesWorkflow(container)
 * .run({
 *   input: {
 *     // import { RuleType } from "@medusajs/framework/utils"
 *     rule_type: RuleType.RULES,
 *     data: {
 *       id: "promo_123",
 *       rules: [
 *         {
 *           attribute: "cusgrp_123",
 *           operator: "eq",
 *           values: ["cusgrp_123"],
 *         }
 *       ],
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create one or more promotion rules.
 */
export declare const createPromotionRulesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<AddPromotionRulesWorkflowDTO, PromotionRuleDTO[], []>;
//# sourceMappingURL=create-promotion-rules.d.ts.map