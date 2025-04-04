"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capturePaymentWorkflow = exports.capturePaymentWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const add_order_transaction_1 = require("../../order/steps/add-order-transaction");
const capture_payment_1 = require("../steps/capture-payment");
exports.capturePaymentWorkflowId = "capture-payment-workflow";
/**
 * This workflow captures a payment. It's used by the
 * [Capture Payment Admin API Route](https://docs.medusajs.com/api/admin#payments_postpaymentsidcapture).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to capture a payment in your custom flows.
 *
 * @example
 * const { result } = await capturePaymentWorkflow(container)
 * .run({
 *   input: {
 *     payment_id: "pay_123"
 *   }
 * })
 *
 * @summary
 *
 * Capture a payment.
 */
exports.capturePaymentWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.capturePaymentWorkflowId, (input) => {
    const payment = (0, capture_payment_1.capturePaymentStep)(input);
    const orderPayment = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_payment_collection",
        fields: ["order.id"],
        variables: { payment_collection_id: payment.payment_collection_id },
        list: false,
    });
    (0, workflows_sdk_1.when)({ orderPayment }, ({ orderPayment }) => {
        return !!orderPayment?.order?.id;
    }).then(() => {
        const orderTransactionData = (0, workflows_sdk_1.transform)({ input, payment, orderPayment }, ({ input, payment, orderPayment }) => {
            return payment.captures?.map((capture) => {
                return {
                    order_id: orderPayment.order.id,
                    amount: input.amount ?? capture.raw_amount ?? capture.amount,
                    currency_code: payment.currency_code,
                    reference_id: capture.id,
                    reference: "capture",
                };
            });
        });
        (0, add_order_transaction_1.addOrderTransactionStep)(orderTransactionData);
    });
    (0, common_1.emitEventStep)({
        eventName: utils_1.PaymentEvents.CAPTURED,
        data: { id: payment.id },
    });
    return new workflows_sdk_1.WorkflowResponse(payment);
});
//# sourceMappingURL=capture-payment.js.map