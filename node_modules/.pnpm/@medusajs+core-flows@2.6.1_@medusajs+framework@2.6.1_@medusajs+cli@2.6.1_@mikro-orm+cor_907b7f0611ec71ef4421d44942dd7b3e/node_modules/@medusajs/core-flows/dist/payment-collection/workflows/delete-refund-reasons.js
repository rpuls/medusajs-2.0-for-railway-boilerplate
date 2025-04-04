"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRefundReasonsWorkflow = exports.deleteRefundReasonsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.deleteRefundReasonsWorkflowId = "delete-refund-reasons-workflow";
/**
 * This workflow deletes one or more refund reasons. It's used by the
 * [Delete Refund Reason Admin API Route](https://docs.medusajs.com/api/admin#refund-reasons_deleterefundreasonsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete refund reasons in your custom flows.
 *
 * @example
 * const { result } = await deleteRefundReasonsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["refres_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete refund reasons.
 */
exports.deleteRefundReasonsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteRefundReasonsWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.deleteRefundReasonsStep)(input.ids));
});
//# sourceMappingURL=delete-refund-reasons.js.map