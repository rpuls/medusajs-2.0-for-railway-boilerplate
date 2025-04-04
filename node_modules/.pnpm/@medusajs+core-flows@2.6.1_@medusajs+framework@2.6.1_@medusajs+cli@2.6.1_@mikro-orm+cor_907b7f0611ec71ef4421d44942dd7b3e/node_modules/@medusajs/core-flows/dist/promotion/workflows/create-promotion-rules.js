"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPromotionRulesWorkflow = exports.createPromotionRulesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.createPromotionRulesWorkflowId = "create-promotion-rules-workflow";
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
exports.createPromotionRulesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createPromotionRulesWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.addRulesToPromotionsStep)(input));
});
//# sourceMappingURL=create-promotion-rules.js.map