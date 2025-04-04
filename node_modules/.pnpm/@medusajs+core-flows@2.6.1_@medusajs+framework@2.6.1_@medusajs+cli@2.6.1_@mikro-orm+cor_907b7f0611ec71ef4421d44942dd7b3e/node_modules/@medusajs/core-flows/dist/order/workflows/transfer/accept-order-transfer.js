"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptOrderTransferWorkflow = exports.acceptOrderTransferWorkflowId = exports.acceptOrderTransferValidationStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/utils");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const confirm_order_changes_1 = require("../../steps/confirm-order-changes");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that an order transfer can be accepted. If the
 * order doesn't have an existing transfer request, the step throws an error.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = acceptOrderTransferValidationStep({
 *   token: "sk_123456",
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "order_change_123",
 *     // other order change details...
 *   }
 * })
 */
exports.acceptOrderTransferValidationStep = (0, workflows_sdk_1.createStep)("accept-order-transfer-validation", async function ({ token, order, orderChange, }) {
    (0, order_validation_1.throwIfOrderIsCancelled)({ order });
    if (!orderChange || orderChange.change_type !== "transfer") {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Order ${order.id} does not have an order transfer request.`);
    }
    const transferCustomerAction = orderChange.actions.find((a) => a.action === utils_1.ChangeActionType.TRANSFER_CUSTOMER);
    if (!token.length || token !== transferCustomerAction?.details.token) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Invalid token.");
    }
});
exports.acceptOrderTransferWorkflowId = "accept-order-transfer-workflow";
/**
 * This workflow accepts an order transfer, requested previously by the {@link requestOrderTransferWorkflow}. This workflow is used by the
 * [Accept Order Transfer Store API Route](https://docs.medusajs.com/api/store#orders_postordersidtransferaccept).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to build a custom flow
 * around accepting an order transfer.
 *
 * @example
 * const { result } = await acceptOrderTransferWorkflow(container)
 * .run({
 *   input: {
 *     token: "sk_123456",
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Accept an order transfer request.
 */
exports.acceptOrderTransferWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.acceptOrderTransferWorkflowId, function (input) {
    const orderQuery = (0, common_1.useQueryGraphStep)({
        entity: "order",
        fields: ["id", "email", "status", "customer_id"],
        filters: { id: input.order_id },
        options: { throwIfKeyNotFound: true },
    }).config({ name: "order-query" });
    const order = (0, workflows_sdk_1.transform)({ orderQuery }, ({ orderQuery }) => orderQuery.data[0]);
    const orderChangeQuery = (0, common_1.useQueryGraphStep)({
        entity: "order_change",
        fields: [
            "id",
            "status",
            "change_type",
            "actions.id",
            "actions.order_id",
            "actions.action",
            "actions.details",
            "actions.reference",
            "actions.reference_id",
            "actions.internal_note",
        ],
        filters: {
            order_id: input.order_id,
            status: [utils_1.OrderChangeStatus.REQUESTED],
        },
    }).config({ name: "order-change-query" });
    const orderChange = (0, workflows_sdk_1.transform)({ orderChangeQuery }, ({ orderChangeQuery }) => orderChangeQuery.data[0]);
    (0, exports.acceptOrderTransferValidationStep)({
        order,
        orderChange,
        token: input.token,
    });
    (0, confirm_order_changes_1.confirmOrderChanges)({
        changes: [orderChange],
        orderId: order.id,
    });
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.previewOrderChangeStep)(input.order_id));
});
//# sourceMappingURL=accept-order-transfer.js.map