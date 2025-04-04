"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelReturnReceiveWorkflow = exports.cancelReturnReceiveWorkflowId = exports.cancelReceiveReturnValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that a return receival can be canceled.
 * If the order or return is canceled, or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, return, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = cancelReceiveReturnValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderReturn: {
 *     id: "return_123",
 *     // other order return details...
 *   }
 * })
 */
exports.cancelReceiveReturnValidationStep = (0, workflows_sdk_1.createStep)("validate-cancel-return-shipping-method", async function ({ order, orderChange, orderReturn, }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfIsCancelled)(orderReturn, "Return");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
});
exports.cancelReturnReceiveWorkflowId = "cancel-receive-return";
/**
 * This workflow cancels a return receival. It's used by the
 * [Cancel Return Receival Admin API Route](https://docs.medusajs.com/api/admin#returns_deletereturnsidreceive).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to cancel a return receival in your custom flow.
 *
 * @example
 * const { result } = await cancelReturnReceiveWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *   }
 * })
 *
 * @summary
 *
 * Cancel a return receival.
 */
exports.cancelReturnReceiveWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.cancelReturnReceiveWorkflowId, function (input) {
    const orderReturn = (0, common_1.useRemoteQueryStep)({
        entry_point: "return",
        fields: ["id", "status", "order_id", "canceled_at"],
        variables: { id: input.return_id },
        list: false,
        throw_if_key_not_found: true,
    });
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "version", "canceled_at"],
        variables: { id: orderReturn.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: ["id", "status", "version"],
        variables: {
            filters: {
                order_id: orderReturn.order_id,
                return_id: orderReturn.id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, exports.cancelReceiveReturnValidationStep)({ order, orderReturn, orderChange });
    (0, steps_1.deleteOrderChangesStep)({ ids: [orderChange.id] });
});
//# sourceMappingURL=cancel-receive-return.js.map