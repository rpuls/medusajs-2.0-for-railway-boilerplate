"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRefundReasonsWorkflow = exports.updateRefundReasonsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.updateRefundReasonsWorkflowId = "update-refund-reasons";
/**
 * This workflow updates one or more refund reasons. It's used by the
 * [Update Refund Reason Admin API Route](https://docs.medusajs.com/api/admin#refund-reasons_postrefundreasonsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update refund reasons in your custom flows.
 *
 * @example
 * const { result } = await updateRefundReasonsWorkflow(container)
 * .run({
 *   input: [
 *     {
 *       id: "refres_123",
 *       label: "Damaged",
 *     }
 *   ]
 * })
 *
 * @summary
 *
 * Update refund reasons.
 */
exports.updateRefundReasonsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateRefundReasonsWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.updateRefundReasonsStep)(input));
});
//# sourceMappingURL=update-refund-reasons.js.map