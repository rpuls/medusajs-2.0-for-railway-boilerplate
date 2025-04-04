"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchPromotionRulesWorkflow = exports.batchPromotionRulesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const delete_promotion_rules_workflow_1 = require("../steps/delete-promotion-rules-workflow");
const create_promotion_rules_1 = require("./create-promotion-rules");
const update_promotion_rules_1 = require("./update-promotion-rules");
exports.batchPromotionRulesWorkflowId = "batch-promotion-rules";
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
exports.batchPromotionRulesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.batchPromotionRulesWorkflowId, (input) => {
    const createInput = (0, workflows_sdk_1.transform)({ input }, (data) => ({
        rule_type: data.input.rule_type,
        data: { id: data.input.id, rules: data.input.create ?? [] },
    }));
    const updateInput = (0, workflows_sdk_1.transform)({ input }, (data) => ({
        data: data.input.update ?? [],
    }));
    const deleteInput = (0, workflows_sdk_1.transform)({ input }, (data) => ({
        rule_type: data.input.rule_type,
        data: { id: data.input.id, rule_ids: data.input.delete ?? [] },
    }));
    const [created, updated, deleted] = (0, workflows_sdk_1.parallelize)(create_promotion_rules_1.createPromotionRulesWorkflow.runAsStep({
        input: createInput,
    }), update_promotion_rules_1.updatePromotionRulesWorkflow.runAsStep({
        input: updateInput,
    }), (0, delete_promotion_rules_workflow_1.deletePromotionRulesWorkflowStep)(deleteInput));
    return new workflows_sdk_1.WorkflowResponse((0, workflows_sdk_1.transform)({ created, updated, deleted }, (data) => data));
});
//# sourceMappingURL=batch-promotion-rules.js.map