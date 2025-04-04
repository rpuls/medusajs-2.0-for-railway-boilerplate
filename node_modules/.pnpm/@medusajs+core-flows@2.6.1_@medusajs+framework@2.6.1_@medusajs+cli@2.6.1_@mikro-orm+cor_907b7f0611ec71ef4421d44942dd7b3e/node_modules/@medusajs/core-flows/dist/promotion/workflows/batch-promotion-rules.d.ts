import { BatchWorkflowInput, BatchWorkflowOutput, CreatePromotionRuleDTO, PromotionRuleDTO, UpdatePromotionRuleDTO } from "@medusajs/framework/types";
import { RuleType } from "@medusajs/framework/utils";
/**
 * The data to manage a promotion's rules.
 *
 * @property id - The ID of the promotion to manage the rules of.
 * @property rule_type - The type of rule to manage.
 * @property create - The rules to create.
 * @property update - The rules to update.
 * @property delete - The IDs of the rules to delete.
 */
export interface BatchPromotionRulesWorkflowInput extends BatchWorkflowInput<CreatePromotionRuleDTO, UpdatePromotionRuleDTO> {
    id: string;
    rule_type: RuleType;
}
/**
 * The result of managing the promotion's rules.
 *
 * @property created - The created rules.
 * @property updated - The updated rules.
 * @property deleted - The deleted rule IDs.
 */
export interface BatchPromotionRulesWorkflowOutput extends BatchWorkflowOutput<PromotionRuleDTO> {
}
export declare const batchPromotionRulesWorkflowId = "batch-promotion-rules";
/**
 * This workflow manages a promotion's rules. It's used by the
 * [Manage Promotion Rules Admin API Route](https://docs.medusajs.com/api/admin#promotions_postpromotionsidrulesbatch),
 * [Manage Promotion Buy Rules Admin API Route](https://docs.medusajs.com/api/admin#promotions_postpromotionsidbuyrulesbatch),
 * and [Manage Promotion Target Rules Admin API Route](https://docs.medusajs.com/api/admin#promotions_postpromotionsidtargetrulesbatch).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * manage promotion rules within your custom flows.
 *
 * @example
 * const { result } = await batchPromotionRulesWorkflow(container)
 * .run({
 *   input: {
 *     id: "promo_123",
 *     // import { RuleType } from "@medusajs/framework/utils"
 *     rule_type: RuleType.RULES,
 *     create: [
 *       {
 *         attribute: "cusgrp_123",
 *         operator: "eq",
 *         values: ["cusgrp_123"],
 *       }
 *     ],
 *     update: [
 *       {
 *         id: "prule_123",
 *         attribute: "cusgrp_123"
 *       }
 *     ],
 *     delete: ["prule_123"]
 *   }
 * })
 *
 * @summary
 *
 * Manage the rules of a promotion.
 */
export declare const batchPromotionRulesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<BatchPromotionRulesWorkflowInput, BatchPromotionRulesWorkflowOutput, []>;
//# sourceMappingURL=batch-promotion-rules.d.ts.map