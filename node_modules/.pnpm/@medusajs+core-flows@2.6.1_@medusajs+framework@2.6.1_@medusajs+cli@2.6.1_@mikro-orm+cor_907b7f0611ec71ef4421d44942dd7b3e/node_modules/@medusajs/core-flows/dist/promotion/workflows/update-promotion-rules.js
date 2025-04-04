"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePromotionRulesWorkflow = exports.updatePromotionRulesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.updatePromotionRulesWorkflowId = "update-promotion-rules-workflow";
/**
 * This workflow updates one or more promotion rules. It's used by other workflows,
 * such as {@link batchPromotionRulesWorkflow} that manages the rules of a promotion.
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * update promotion rules within your custom flows.
 *
 * @example
 * const { result } = await updatePromotionRulesWorkflow(container)
 * .run({
 *   input: {
 *     data: [
 *       {
 *         id: "prule_123",
 *         attribute: "cusgrp_123",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Update one or more promotion rules.
 */
exports.updatePromotionRulesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updatePromotionRulesWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.updatePromotionRulesStep)(input));
});
//# sourceMappingURL=update-promotion-rules.js.map