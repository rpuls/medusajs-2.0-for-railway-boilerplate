"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelFulfillmentWorkflow = exports.cancelFulfillmentWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.cancelFulfillmentWorkflowId = "cancel-fulfillment-workflow";
/**
 * This workflow cancels a fulfillment. It's used by the
 * [Cancel Fulfillment Admin API Route](https://docs.medusajs.com/api/admin#fulfillments_postfulfillmentsidcancel).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * cancel a fulfillment within your custom flows.
 *
 * @example
 * const { result } = await cancelFulfillmentWorkflow(container)
 * .run({
 *   input: {
 *     id: "ful_123"
 *   }
 * })
 *
 * @summary
 *
 * Cancel a fulfillment.
 */
exports.cancelFulfillmentWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.cancelFulfillmentWorkflowId, (input) => {
    (0, steps_1.cancelFulfillmentStep)(input.id);
});
//# sourceMappingURL=cancel-fulfillment.js.map