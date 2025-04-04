"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveAndCompleteReturnOrderWorkflow = exports.receiveAndCompleteReturnOrderWorkflowId = exports.receiveCompleteReturnValidationStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const receive_return_1 = require("../../steps/return/receive-return");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that a return can be received and completed.
 * If the return is canceled or the items do not exist in the return, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve a return details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = receiveCompleteReturnValidationStep({
 *   orderReturn: {
 *     id: "return_123",
 *     // other return details...
 *   },
 *   input: {
 *     return_id: "return_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 */
exports.receiveCompleteReturnValidationStep = (0, workflows_sdk_1.createStep)("receive-return-order-validation", async function ({ orderReturn, input, }, context) {
    (0, order_validation_1.throwIfIsCancelled)(orderReturn, "Return");
    (0, order_validation_1.throwIfItemsDoesNotExistsInReturn)({ orderReturn, inputItems: input.items });
});
exports.receiveAndCompleteReturnOrderWorkflowId = "receive-return-order";
/**
 * This workflow marks a return as received and completes it.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to receive and complete a return.
 *
 * @example
 * const { result } = await receiveAndCompleteReturnOrderWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Receive and complete a return.
 */
exports.receiveAndCompleteReturnOrderWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.receiveAndCompleteReturnOrderWorkflowId, function (input) {
    const orderReturn = (0, common_1.useRemoteQueryStep)({
        entry_point: "returns",
        fields: ["id", "canceled_at", "items.*"],
        variables: { id: input.return_id },
        list: false,
        throw_if_key_not_found: true,
    });
    (0, exports.receiveCompleteReturnValidationStep)({ orderReturn, input });
    return new workflows_sdk_1.WorkflowResponse((0, receive_return_1.receiveReturnStep)(input));
});
//# sourceMappingURL=receive-complete-return.js.map