/**
 * The data to cancel one or more payments.
 */
export type CancelPaymentStepInput = {
    /**
     * The ID(s) of the payment(s) to cancel.
     */
    paymentIds: string | string[];
};
export declare const cancelPaymentStepId = "cancel-payment-step";
/**
 * This step cancels one or more payments.
 */
export declare const cancelPaymentStep: import("@medusajs/framework/workflows-sdk").StepFunction<CancelPaymentStepInput, unknown>;
//# sourceMappingURL=cancel-payment.d.ts.map