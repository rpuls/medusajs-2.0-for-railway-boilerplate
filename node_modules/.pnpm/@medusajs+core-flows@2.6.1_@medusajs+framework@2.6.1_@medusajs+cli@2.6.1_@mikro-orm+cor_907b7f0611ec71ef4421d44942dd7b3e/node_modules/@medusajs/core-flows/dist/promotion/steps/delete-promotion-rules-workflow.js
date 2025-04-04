"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePromotionRulesWorkflowStep = exports.deletePromotionRulesWorkflowStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const delete_promotion_rules_1 = require("../workflows/delete-promotion-rules");
exports.deletePromotionRulesWorkflowStepId = "delete-promotion-rules-workflow";
/**
 * This step deletes promotion rules using the {@link deletePromotionRulesWorkflow}.
 */
exports.deletePromotionRulesWorkflowStep = (0, workflows_sdk_1.createStep)(exports.deletePromotionRulesWorkflowStepId, async (data, { container }) => {
    const { transaction, errors } = await (0, delete_promotion_rules_1.deletePromotionRulesWorkflow)(container).run({
        input: data,
        throwOnError: false,
    });
    if (errors?.length) {
        throw errors[0].error;
    }
    return new workflows_sdk_1.StepResponse(data.data.rule_ids ?? [], transaction);
}, async (transaction, { container }) => {
    if (!transaction) {
        return;
    }
    await (0, delete_promotion_rules_1.deletePromotionRulesWorkflow)(container).cancel({ transaction });
});
//# sourceMappingURL=delete-promotion-rules-workflow.js.map