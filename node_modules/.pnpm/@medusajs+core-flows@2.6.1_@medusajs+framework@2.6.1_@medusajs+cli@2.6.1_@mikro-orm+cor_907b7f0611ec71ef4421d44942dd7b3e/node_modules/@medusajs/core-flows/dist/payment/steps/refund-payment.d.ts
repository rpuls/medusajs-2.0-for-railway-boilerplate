import { BigNumberInput } from "@medusajs/framework/types";
/**
 * The data to refund a payment.
 */
export type RefundPaymentStepInput = {
    /**
     * The ID of the payment to refund.
     */
    payment_id: string;
    /**
     * The ID of the user that refunded the payment.
     */
    created_by?: string;
    /**
     * The amount to refund. If not provided, the full refundable amount is refunded.
     */
    amount?: BigNumberInput;
};
export declare const refundPaymentStepId = "refund-payment-step";
/**
 * This step refunds a payment.
 */
export declare const refundPaymentStep: import("@medusajs/framework/workflows-sdk").StepFunction<RefundPaymentStepInput, import("@medusajs/framework/types").PaymentDTO>;
//# sourceMappingURL=refund-payment.d.ts.map