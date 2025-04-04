"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelReturnWorkflow = exports.cancelReturnWorkflowId = exports.cancelReturnValidateOrder = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that a return can be canceled.
 * If the return is canceled, its fulfillment aren't canceled,
 * or it has received items, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve a return details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = cancelReturnValidateOrder({
 *   orderReturn: {
 *     id: "return_123",
 *     // other order return details...
 *   },
 *   input: {
 *     return_id: "return_123"
 *   }
 * })
 */
exports.cancelReturnValidateOrder = (0, workflows_sdk_1.createStep)("validate-return", ({ orderReturn, }) => {
    const orderReturn_ = orderReturn;
    (0, order_validation_1.throwIfIsCancelled)(orderReturn, "Return");
    const throwErrorIf = (arr, pred, message) => {
        if (arr?.some(pred)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, message);
        }
    };
    const notCanceled = (o) => !o.canceled_at;
    const hasReceived = (o) => utils_1.MathBN.gt(o.received_quantity, 0);
    throwErrorIf(orderReturn_.fulfillments, notCanceled, "All fulfillments must be canceled before canceling a return");
    throwErrorIf(orderReturn_.items, hasReceived, "Can't cancel a return which has returned items");
});
exports.cancelReturnWorkflowId = "cancel-return";
/**
 * This workflow cancels a return. It's used by the
 * [Cancel Return Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturnsidcancel).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to cancel a return in your custom flow.
 *
 * @example
 * const { result } = await cancelReturnWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *   }
 * })
 *
 * @summary
 *
 * Cancel a return.
 */
exports.cancelReturnWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.cancelReturnWorkflowId, (input) => {
    const orderReturn = (0, common_1.useRemoteQueryStep)({
        entry_point: "return",
        fields: [
            "id",
            "order_id",
            "canceled_at",
            "items.id",
            "items.received_quantity",
            "fulfillments.canceled_at",
        ],
        variables: { id: input.return_id },
        list: false,
        throw_if_key_not_found: true,
    });
    (0, exports.cancelReturnValidateOrder)({ orderReturn, input });
    (0, steps_1.cancelOrderReturnStep)({
        return_id: orderReturn.id,
        order_id: orderReturn.order_id,
        canceled_by: input.canceled_by,
    });
});
//# sourceMappingURL=cancel-return.js.map