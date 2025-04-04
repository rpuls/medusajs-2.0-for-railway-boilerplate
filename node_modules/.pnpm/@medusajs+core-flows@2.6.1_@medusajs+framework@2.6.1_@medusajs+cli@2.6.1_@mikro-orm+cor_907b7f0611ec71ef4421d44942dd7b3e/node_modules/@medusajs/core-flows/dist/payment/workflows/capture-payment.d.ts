import { BigNumberInput, PaymentDTO } from "@medusajs/framework/types";
/**
 * The data to capture a payment.
 */
export type CapturePaymentWorkflowInput = {
    /**
     * The ID of the payment to capture.
     */
    payment_id: string;
    /**
     * The ID of the user that captured the payment.
     */
    captured_by?: string;
    /**
     * The amount to capture. If not provided, the full payment amount will be captured.
     */
    amount?: BigNumberInput;
};
export declare const capturePaymentWorkflowId = "capture-payment-workflow";
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
export declare const capturePaymentWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CapturePaymentWorkflowInput, PaymentDTO, []>;
//# sourceMappingURL=capture-payment.d.ts.map