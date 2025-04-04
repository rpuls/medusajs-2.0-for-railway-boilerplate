"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markFulfillmentAsDeliveredWorkflow = exports.markFulfillmentAsDeliveredWorkflowId = exports.validateFulfillmentDeliverabilityStep = exports.validateFulfillmentDeliverabilityStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const update_fulfillment_1 = require("./update-fulfillment");
exports.validateFulfillmentDeliverabilityStepId = "validate-fulfillment-deliverability";
/**
 * This step validates that a fulfillment can be marked delivered.
 * If the fulfillment has already been canceled or delivered, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve a fulfillment's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = validateFulfillmentDeliverabilityStep({
 *   id: "ful_123",
 *   // other fulfillment data...
 * })
 */
exports.validateFulfillmentDeliverabilityStep = (0, workflows_sdk_1.createStep)(exports.validateFulfillmentDeliverabilityStepId, async (fulfillment) => {
    if (fulfillment.canceled_at) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Cannot deliver an already canceled fulfillment");
    }
    if (fulfillment.delivered_at) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Fulfillment has already been marked delivered");
    }
    return new workflows_sdk_1.StepResponse(void 0);
});
exports.markFulfillmentAsDeliveredWorkflowId = "mark-fulfillment-as-delivered-workflow";
/**
 * This workflow marks a fulfillment as delivered. It's used by the {@link markOrderFulfillmentAsDeliveredWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to mark a fulfillment as delivered in your custom flows.
 *
 * @example
 * const { result } = await markFulfillmentAsDeliveredWorkflow(container)
 * .run({
 *   input: {
 *     id: "ful_123",
 *   }
 * })
 *
 * @summary
 *
 * Mark a fulfillment as delivered.
 */
exports.markFulfillmentAsDeliveredWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.markFulfillmentAsDeliveredWorkflowId, ({ id }) => {
    const fulfillment = (0, common_1.useRemoteQueryStep)({
        entry_point: "fulfillment",
        fields: ["id", "delivered_at", "canceled_at"],
        variables: { id },
        throw_if_key_not_found: true,
        list: false,
    });
    (0, exports.validateFulfillmentDeliverabilityStep)(fulfillment);
    const updateInput = (0, workflows_sdk_1.transform)({ id }, ({ id }) => ({
        id,
        delivered_at: new Date(),
    }));
    return new workflows_sdk_1.WorkflowResponse(update_fulfillment_1.updateFulfillmentWorkflow.runAsStep({ input: updateInput }));
});
//# sourceMappingURL=mark-fulfillment-as-delivered.js.map