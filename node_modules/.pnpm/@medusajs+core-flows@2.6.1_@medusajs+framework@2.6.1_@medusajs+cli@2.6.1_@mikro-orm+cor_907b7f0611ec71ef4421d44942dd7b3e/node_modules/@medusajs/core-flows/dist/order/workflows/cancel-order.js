"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderWorkflow = exports.cancelOrderWorkflowId = exports.cancelValidateOrder = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const payment_collection_1 = require("../../payment-collection");
const steps_1 = require("../../payment/steps");
const steps_2 = require("../../reservation/steps");
const cancel_orders_1 = require("../steps/cancel-orders");
const order_validation_1 = require("../utils/order-validation");
const create_order_refund_credit_lines_1 = require("./payments/create-order-refund-credit-lines");
const refund_captured_payments_1 = require("./payments/refund-captured-payments");
/**
 * This step validates that an order can be canceled. If the order has fulfillments that
 * aren't canceled, or the order was canceled previously, the step throws an error.
 *
 * :::note
 *
 * You can retrieve an order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = cancelValidateOrder({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 */
exports.cancelValidateOrder = (0, workflows_sdk_1.createStep)("cancel-validate-order", ({ order, }) => {
    const order_ = order;
    (0, order_validation_1.throwIfOrderIsCancelled)({ order });
    const throwErrorIf = (arr, pred, type) => {
        if (arr?.some(pred)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `All ${type} must be canceled before canceling an order`);
        }
    };
    const notCanceled = (o) => !o.canceled_at;
    throwErrorIf(order_.fulfillments, notCanceled, "fulfillments");
});
exports.cancelOrderWorkflowId = "cancel-order";
/**
 * This workflow cancels an order. An order can only be canceled if it doesn't have
 * any fulfillments, or if all fulfillments are canceled. The workflow will also cancel
 * any uncaptured payments, and refund any captured payments.
 *
 * This workflow is used by the [Cancel Order Admin API Route](https://docs.medusajs.com/api/admin#orders_postordersidcancel).
 *
 * This workflow has a hook that allows you to perform custom actions on the canceled order. For example, you can
 * make changes to custom models linked to the order.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around canceling an order.
 *
 * @example
 * const { result } = await cancelOrderWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Cancel an order.
 *
 * @property hooks.orderCanceled - This hook is executed after the order is canceled. You can consume this hook to perform custom actions on the canceled order.
 */
exports.cancelOrderWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.cancelOrderWorkflowId, (input) => {
    const orderQuery = (0, common_1.useQueryGraphStep)({
        entity: "orders",
        fields: [
            "id",
            "status",
            "items.id",
            "fulfillments.canceled_at",
            "payment_collections.payments.id",
            "payment_collections.payments.amount",
            "payment_collections.payments.refunds.id",
            "payment_collections.payments.refunds.amount",
            "payment_collections.payments.captures.id",
            "payment_collections.payments.captures.amount",
        ],
        filters: { id: input.order_id },
        options: { throwIfKeyNotFound: true },
    }).config({ name: "get-cart" });
    const order = (0, workflows_sdk_1.transform)({ orderQuery }, ({ orderQuery }) => orderQuery.data[0]);
    (0, exports.cancelValidateOrder)({ order, input });
    const uncapturedPaymentIds = (0, workflows_sdk_1.transform)({ order }, ({ order }) => {
        const payments = (0, utils_1.deepFlatMap)(order, "payment_collections.payments", ({ payments }) => payments);
        const uncapturedPayments = payments.filter((payment) => payment.captures.length === 0);
        return uncapturedPayments.map((payment) => payment.id);
    });
    const creditLineAmount = (0, workflows_sdk_1.transform)({ order }, ({ order }) => {
        const payments = (0, utils_1.deepFlatMap)(order, "payment_collections.payments", ({ payments }) => payments);
        return payments.reduce((acc, payment) => utils_1.MathBN.sum(acc, payment.amount), utils_1.MathBN.convert(0));
    });
    const lineItemIds = (0, workflows_sdk_1.transform)({ order }, ({ order }) => {
        return order.items?.map((i) => i.id);
    });
    (0, workflows_sdk_1.parallelize)(create_order_refund_credit_lines_1.createOrderRefundCreditLinesWorkflow.runAsStep({
        input: {
            order_id: order.id,
            amount: creditLineAmount,
        },
    }), (0, steps_2.deleteReservationsByLineItemsStep)(lineItemIds), (0, steps_1.cancelPaymentStep)({ paymentIds: uncapturedPaymentIds }), refund_captured_payments_1.refundCapturedPaymentsWorkflow.runAsStep({
        input: { order_id: order.id, created_by: input.canceled_by },
    }), (0, common_1.emitEventStep)({
        eventName: utils_1.OrderWorkflowEvents.CANCELED,
        data: { id: order.id },
    }));
    const paymentCollectionids = (0, workflows_sdk_1.transform)({ order }, ({ order }) => order.payment_collections?.map((pc) => pc.id));
    (0, workflows_sdk_1.when)({ paymentCollectionids }, ({ paymentCollectionids }) => {
        return !!paymentCollectionids?.length;
    }).then(() => {
        (0, payment_collection_1.updatePaymentCollectionStep)({
            selector: { id: paymentCollectionids },
            update: { status: utils_1.PaymentCollectionStatus.CANCELED },
        });
    });
    (0, cancel_orders_1.cancelOrdersStep)({ orderIds: [order.id] });
    const orderCanceled = (0, workflows_sdk_1.createHook)("orderCanceled", {
        order,
    });
    return new workflows_sdk_1.WorkflowResponse(void 0, {
        hooks: [orderCanceled],
    });
});
//# sourceMappingURL=cancel-order.js.map