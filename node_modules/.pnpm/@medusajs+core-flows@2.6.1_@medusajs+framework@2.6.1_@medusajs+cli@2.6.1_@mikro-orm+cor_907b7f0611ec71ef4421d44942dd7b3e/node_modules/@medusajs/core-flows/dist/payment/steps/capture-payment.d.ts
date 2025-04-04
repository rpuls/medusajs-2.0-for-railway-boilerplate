import { BigNumberInput } from "@medusajs/framework/types";
/**
 * The data to capture a payment.
 */
export type CapturePaymentStepInput = {
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
export declare const capturePaymentStepId = "capture-payment-step";
/**
 * This step captures a payment.
 */
export declare const capturePaymentStep: import("@medusajs/framework/workflows-sdk").StepFunction<CapturePaymentStepInput, import("@medusajs/framework/types").PaymentDTO>;
//# sourceMappingURL=capture-payment.d.ts.map