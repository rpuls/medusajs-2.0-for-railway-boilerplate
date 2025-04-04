export interface StoreCreatePaymentCollection {
    cart_id: string;
}
export interface StoreInitializePaymentSession {
    /**
     * The ID of the provider to initialize a payment session
     * for.
     */
    provider_id: string;
    /**
     * Any data necessary for the payment provider to process the payment.
     *
     * Learn more in [this documentation](https://docs.medusajs.com/resources/commerce-modules/payment/payment-session#data-property).
     */
    data?: Record<string, unknown>;
}
//# sourceMappingURL=payloads.d.ts.map