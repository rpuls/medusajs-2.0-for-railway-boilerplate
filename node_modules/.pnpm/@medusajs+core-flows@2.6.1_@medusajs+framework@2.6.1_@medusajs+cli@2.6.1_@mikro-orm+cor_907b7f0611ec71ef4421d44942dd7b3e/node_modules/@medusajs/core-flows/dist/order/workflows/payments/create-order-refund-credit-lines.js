"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderRefundCreditLinesWorkflow = exports.createOrderRefundCreditLinesWorkflowId = exports.validateOrderRefundCreditLinesStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const confirm_order_changes_1 = require("../../steps/confirm-order-changes");
const create_order_change_1 = require("../../steps/create-order-change");
const order_validation_1 = require("../../utils/order-validation");
const create_order_change_actions_1 = require("../create-order-change-actions");
/**
 * This step validates that an order refund credit line can be issued
 */
exports.validateOrderRefundCreditLinesStep = (0, workflows_sdk_1.createStep)("validate-order-refund-credit-lines", async function ({ order }) {
    (0, order_validation_1.throwIfOrderIsCancelled)({ order });
});
exports.createOrderRefundCreditLinesWorkflowId = "create-order-refund-credit-lines";
/**
 * This workflow creates an order refund credit line
 */
exports.createOrderRefundCreditLinesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createOrderRefundCreditLinesWorkflowId, function (input) {
    const orderQuery = (0, common_1.useQueryGraphStep)({
        entity: "orders",
        fields: ["id", "status", "summary", "payment_collections.id"],
        filters: { id: input.order_id },
        options: { throwIfKeyNotFound: true },
    }).config({ name: "get-order" });
    const order = (0, workflows_sdk_1.transform)({ orderQuery }, ({ orderQuery }) => orderQuery.data[0]);
    (0, exports.validateOrderRefundCreditLinesStep)({ order });
    const orderChangeInput = (0, workflows_sdk_1.transform)({ input }, ({ input }) => ({
        change_type: utils_1.OrderChangeType.CREDIT_LINE,
        order_id: input.order_id,
        created_by: input.created_by,
    }));
    const createdOrderChange = (0, create_order_change_1.createOrderChangeStep)(orderChangeInput);
    const orderChangeActionInput = (0, workflows_sdk_1.transform)({ order, orderChange: createdOrderChange, input }, ({ order, orderChange, input }) => ({
        order_change_id: orderChange.id,
        order_id: order.id,
        version: orderChange.version,
        action: utils_1.ChangeActionType.CREDIT_LINE_ADD,
        reference: "payment_collection",
        reference_id: order.payment_collections[0]?.id,
        amount: input.amount,
    }));
    create_order_change_actions_1.createOrderChangeActionsWorkflow.runAsStep({
        input: [orderChangeActionInput],
    });
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
            status: [utils_1.OrderChangeStatus.PENDING],
        },
    }).config({ name: "order-change-query" });
    const orderChange = (0, workflows_sdk_1.transform)({ orderChangeQuery }, ({ orderChangeQuery }) => orderChangeQuery.data[0]);
    (0, confirm_order_changes_1.confirmOrderChanges)({
        changes: [orderChange],
        orderId: order.id,
    });
});
//# sourceMappingURL=create-order-refund-credit-lines.js.map