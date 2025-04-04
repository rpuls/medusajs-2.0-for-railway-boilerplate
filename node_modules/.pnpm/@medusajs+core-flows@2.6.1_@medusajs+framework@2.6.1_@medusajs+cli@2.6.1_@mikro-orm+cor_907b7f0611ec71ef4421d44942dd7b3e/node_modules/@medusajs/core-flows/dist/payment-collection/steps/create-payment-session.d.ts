import { BigNumberInput, PaymentProviderContext } from "@medusajs/framework/types";
/**
 * The data to create a payment session.
 */
export interface CreatePaymentSessionStepInput {
    /**
     * The ID of the payment collection that the session belongs to.
     */
    payment_collection_id: string;
    /**
     * The ID of the payment provider that the payment session is associated with.
     */
    provider_id: string;
    /**
     * The payment session's amount.
     */
    amount: BigNumberInput;
    /**
     * The currency code of the payment session.
     *
     * @example
     * usd
     */
    currency_code: string;
    /**
     * Additional context that's useful for the payment provider to process the payment session.
     */
    context?: PaymentProviderContext;
    /**
     * Custom data relevant for the payment provider to process the payment session.
     * Learn more in [this documentation](https://docs.medusajs.com/resources/commerce-modules/payment/payment-session#data-property).
     */
    data?: Record<string, unknown>;
}
export declare const createPaymentSessionStepId = "create-payment-session";
/**
 * This step creates a payment session.
 */
export declare const createPaymentSessionStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreatePaymentSessionStepInput, import("@medusajs/framework/types").PaymentSessionDTO>;
//# sourceMappingURL=create-payment-session.d.ts.map