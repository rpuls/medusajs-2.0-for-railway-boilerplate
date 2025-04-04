"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markPaymentCollectionAsPaid = exports.markPaymentCollectionAsPaidId = exports.throwUnlessPaymentCollectionNotPaid = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const payment_1 = require("../../payment");
const payment_collection_1 = require("../../payment-collection");
/**
 * This step validates that the payment collection is not paid. If not valid,
 * the step will throw an error.
 *
 * :::note
 *
 * You can retrieve a payment collection's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = throwUnlessPaymentCollectionNotPaid({
 *   paymentCollection: {
 *     id: "paycol_123",
 *     // other payment details...
 *   }
 * })
 */
exports.throwUnlessPaymentCollectionNotPaid = (0, workflows_sdk_1.createStep)("validate-existing-payment-collection", ({ paymentCollection }) => {
    if (paymentCollection.status !== "not_paid") {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `Can only mark 'not_paid' payment collection as paid`);
    }
});
const systemPaymentProviderId = "pp_system_default";
exports.markPaymentCollectionAsPaidId = "mark-payment-collection-as-paid";
/**
 * This workflow marks a payment collection for an order as paid. It's used by the
 * [Mark Payment Collection as Paid Admin API Route](https://docs.medusajs.com/api/admin#payment-collections_postpaymentcollectionsidmarkaspaid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * marking a payment collection for an order as paid.
 *
 * @example
 * const { result } = await markPaymentCollectionAsPaid(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     payment_collection_id: "paycol_123",
 *   }
 * })
 *
 * @summary
 *
 * Mark a payment collection for an order as paid.
 */
exports.markPaymentCollectionAsPaid = (0, workflows_sdk_1.createWorkflow)(exports.markPaymentCollectionAsPaidId, (input) => {
    const paymentCollection = (0, common_1.useRemoteQueryStep)({
        entry_point: "payment_collection",
        fields: ["id", "status", "amount"],
        variables: { id: input.payment_collection_id },
        throw_if_key_not_found: true,
        list: false,
    });
    (0, exports.throwUnlessPaymentCollectionNotPaid)({ paymentCollection });
    const paymentSession = payment_collection_1.createPaymentSessionsWorkflow.runAsStep({
        input: {
            payment_collection_id: paymentCollection.id,
            provider_id: systemPaymentProviderId,
            data: {},
            context: {},
        },
    });
    const payment = (0, payment_1.authorizePaymentSessionStep)({
        id: paymentSession.id,
    });
    payment_1.capturePaymentWorkflow.runAsStep({
        input: {
            payment_id: payment.id,
            captured_by: input.captured_by,
            amount: paymentCollection.amount,
        },
    });
    return new workflows_sdk_1.WorkflowResponse(payment);
});
//# sourceMappingURL=mark-payment-collection-as-paid.js.map