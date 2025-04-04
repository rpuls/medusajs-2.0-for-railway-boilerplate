import { BigNumberInput, OrderDTO, PaymentDTO } from "@medusajs/framework/types";
/**
 * The data to validate whether the refund is valid for the order.
 */
export type ValidateRefundStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The order's payment details.
     */
    payment: PaymentDTO;
    /**
     * The amound to refund.
     */
    amount?: BigNumberInput;
};
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
export declare const validateRefundStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateRefundStepInput, unknown>;
/**
 * The data to refund a payment.
 */
export type RefundPaymentWorkflowInput = {
    /**
     * The ID of the payment to refund.
     */
    payment_id: string;
    /**
     * The ID of the user that refunded the payment.
     */
    created_by?: string;
    /**
     * The amount to refund. If not provided, the full payment amount will be refunded.
     */
    amount?: BigNumberInput;
};
export declare const refundPaymentWorkflowId = "refund-payment-workflow";
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
export declare const refundPaymentWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<RefundPaymentWorkflowInput, any, []>;
//# sourceMappingURL=refund-payment.d.ts.map