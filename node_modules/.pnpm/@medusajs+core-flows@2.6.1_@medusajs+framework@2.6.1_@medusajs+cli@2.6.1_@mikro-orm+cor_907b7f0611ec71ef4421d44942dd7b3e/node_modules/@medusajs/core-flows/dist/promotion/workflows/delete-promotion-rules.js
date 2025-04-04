"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePromotionRulesWorkflow = exports.deletePromotionRulesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.deletePromotionRulesWorkflowId = "delete-promotion-rules-workflow";
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
exports.deletePromotionRulesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deletePromotionRulesWorkflowId, (input) => {
    return (0, steps_1.removeRulesFromPromotionsStep)(input);
});
//# sourceMappingURL=delete-promotion-rules.js.map