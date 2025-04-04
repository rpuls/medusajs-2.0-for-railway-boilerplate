"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFulfillmentWorkflow = exports.updateFulfillmentWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.updateFulfillmentWorkflowId = "update-fulfillment-workflow";
/**
 * This workflow updates a fulfillment. It's used by other workflows that update a
 * fulfillment, such as {@link markFulfillmentAsDeliveredWorkflow}.
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * update a fulfillment within your custom flows.
 *
 * @example
 * const { result } = await updateFulfillmentWorkflow(container)
 * .run({
 *   input: {
 *     id: "ful_123",
 *     delivered_at: new Date(),
 *   }
 * })
 *
 * @summary
 *
 * Update a fulfillment.
 */
exports.updateFulfillmentWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateFulfillmentWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.updateFulfillmentStep)(input));
});
//# sourceMappingURL=update-fulfillment.js.map