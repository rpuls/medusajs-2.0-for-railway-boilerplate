"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReturnReasonsWorkflow = exports.updateReturnReasonsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.updateReturnReasonsWorkflowId = "update-return-reasons";
/**
 * This workflow updates return reasons matching the specified filters. It's used by the
 * [Update Return Reason Admin API Route](https://docs.medusajs.com/api/admin#return-reasons_postreturnreasonsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update return reasons within your custom flows.
 *
 * @example
 * const { result } = await updateReturnReasonsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "rr_123",
 *     },
 *     update: {
 *       value: "damaged",
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update return reasons.
 */
exports.updateReturnReasonsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateReturnReasonsWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.updateReturnReasonsStep)(input));
});
//# sourceMappingURL=update-return-reasons.js.map