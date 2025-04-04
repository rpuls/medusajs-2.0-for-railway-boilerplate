"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundPaymentWorkflow = exports.refundPaymentWorkflowId = exports.validateRefundStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const add_order_transaction_1 = require("../../order/steps/add-order-transaction");
const refund_payment_1 = require("../steps/refund-payment");
/**
 * This step validates that the refund is valid for the order.
 * If the order does not have an outstanding balance to refund, the step throws an error.
 *
 * :::note
 *
 * You can retrieve an order or payment's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = validateRefundStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   payment: {
 *     id: "payment_123",
 *     // other payment details...
 *   },
 *   amount: 10
 * })
 */
exports.validateRefundStep = (0, workflows_sdk_1.createStep)("validate-refund-step", async function ({ order, payment, amount }) {
    const pendingDifference = order.summary?.raw_pending_difference ??
        order.summary?.pending_difference ??
        0;
    if (utils_1.MathBN.gte(pendingDifference, 0)) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Order does not have an outstanding balance to refund`);
    }
    const amountPending = utils_1.MathBN.mult(pendingDifference, -1);
    const amountToRefund = amount ?? payment.raw_amount ?? payment.amount;
    if (utils_1.MathBN.gt(amountToRefund, amountPending)) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cannot refund more than pending difference - ${amountPending}`);
    }
});
exports.refundPaymentWorkflowId = "refund-payment-workflow";
/**
 * This workflow refunds a payment. It's used by the
 * [Refund Payment Admin API Route](https://docs.medusajs.com/api/admin#payments_postpaymentsidrefund).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to refund a payment in your custom flows.
 *
 * @example
 * const { result } = await refundPaymentWorkflow(container)
 * .run({
 *   input: {
 *     payment_id: "payment_123",
 *   }
 * })
 *
 * @summary
 *
 * Refund a payment.
 */
exports.refundPaymentWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.refundPaymentWorkflowId, (input) => {
    const payment = (0, common_1.useRemoteQueryStep)({
        entry_point: "payment",
        fields: [
            "id",
            "payment_collection_id",
            "currency_code",
            "amount",
            "raw_amount",
        ],
        variables: { id: input.payment_id },
        list: false,
        throw_if_key_not_found: true,
    });
    const orderPaymentCollection = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_payment_collection",
        fields: ["order.id"],
        variables: { payment_collection_id: payment.payment_collection_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-payment-collection" });
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "order",
        fields: ["id", "summary", "currency_code", "region_id"],
        variables: { id: orderPaymentCollection.order.id },
        throw_if_key_not_found: true,
        list: false,
    }).config({ name: "order" });
    (0, exports.validateRefundStep)({ order, payment, amount: input.amount });
    (0, refund_payment_1.refundPaymentStep)(input);
    (0, workflows_sdk_1.when)({ orderPaymentCollection }, ({ orderPaymentCollection }) => {
        return !!orderPaymentCollection?.order?.id;
    }).then(() => {
        const orderTransactionData = (0, workflows_sdk_1.transform)({ input, payment, orderPaymentCollection }, ({ input, payment, orderPaymentCollection }) => {
            return {
                order_id: orderPaymentCollection.order.id,
                amount: utils_1.MathBN.mult(input.amount ?? payment.raw_amount ?? payment.amount, -1),
                currency_code: payment.currency_code ?? order.currency_code,
                reference_id: payment.id,
                reference: "refund",
            };
        });
        (0, add_order_transaction_1.addOrderTransactionStep)(orderTransactionData);
    });
    (0, common_1.emitEventStep)({
        eventName: utils_1.PaymentEvents.REFUNDED,
        data: { id: payment.id },
    });
    return new workflows_sdk_1.WorkflowResponse(payment);
});
//# sourceMappingURL=refund-payment.js.map