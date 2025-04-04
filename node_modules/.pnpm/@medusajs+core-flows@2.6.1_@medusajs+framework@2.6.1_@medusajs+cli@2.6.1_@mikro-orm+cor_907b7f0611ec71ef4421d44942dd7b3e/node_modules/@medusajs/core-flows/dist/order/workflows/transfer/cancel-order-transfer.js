"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderTransferRequestWorkflow = exports.cancelTransferOrderRequestWorkflowId = exports.cancelTransferOrderRequestValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that a requested order transfer can be canceled.
 * If the customer canceling the order transfer isn't the one that requested the transfer,
 * the step throws an error. Admin users can cancel any order transfer.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = cancelTransferOrderRequestValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "order_change_123",
 *     // other order change details...
 *   },
 *   input: {
 *     order_id: "order_123",
 *     logged_in_user_id: "cus_123",
 *     actor_type: "customer"
 *   }
 * })
 */
exports.cancelTransferOrderRequestValidationStep = (0, workflows_sdk_1.createStep)("validate-cancel-transfer-order-request", async function ({ order, orderChange, input, }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
    if (input.actor_type === "user") {
        return;
    }
    const action = orderChange.actions?.find((a) => a.action === utils_1.ChangeActionType.TRANSFER_CUSTOMER);
    if (action?.reference_id !== input.logged_in_user_id) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "This customer is not allowed to cancel the transfer.");
    }
});
exports.cancelTransferOrderRequestWorkflowId = "cancel-transfer-order-request";
/**
 * This workflow cancels a requested order transfer. This operation is allowed only by admin users and the customer that requested the transfer.
 * This workflow is used by the [Cancel Order Transfer Store API Route](https://docs.medusajs.com/api/store#orders_postordersidtransfercancel),
 * and the [Cancel Transfer Request Admin API Route](https://docs.medusajs.com/api/admin#orders_postordersidtransfercancel).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to build a custom flow
 * around canceling an order transfer.
 *
 * @example
 * const { result } = await cancelOrderTransferRequestWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     logged_in_user_id: "cus_123",
 *     actor_type: "customer"
 *   }
 * })
 *
 * @summary
 *
 * Cancel an order transfer request.
 */
exports.cancelOrderTransferRequestWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.cancelTransferOrderRequestWorkflowId, function (input) {
    const orderQuery = (0, common_1.useQueryGraphStep)({
        entity: "order",
        fields: ["id", "version", "canceled_at"],
        filters: { id: input.order_id },
        options: { throwIfKeyNotFound: true },
    }).config({ name: "order-query" });
    const order = (0, workflows_sdk_1.transform)({ orderQuery }, ({ orderQuery }) => orderQuery.data[0]);
    const orderChangeQuery = (0, common_1.useQueryGraphStep)({
        entity: "order_change",
        fields: ["id", "status", "version", "actions.*"],
        filters: {
            order_id: input.order_id,
            status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
        },
    }).config({ name: "order-change-query" });
    const orderChange = (0, workflows_sdk_1.transform)({ orderChangeQuery }, ({ orderChangeQuery }) => orderChangeQuery.data[0]);
    (0, exports.cancelTransferOrderRequestValidationStep)({ order, orderChange, input });
    (0, steps_1.deleteOrderChangesStep)({ ids: [orderChange.id] });
});
//# sourceMappingURL=cancel-order-transfer.js.map