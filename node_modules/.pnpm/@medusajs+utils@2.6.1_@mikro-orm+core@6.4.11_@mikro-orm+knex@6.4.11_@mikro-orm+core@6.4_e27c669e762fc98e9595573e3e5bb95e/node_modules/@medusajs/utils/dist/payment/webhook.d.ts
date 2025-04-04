export declare enum PaymentWebhookEvents {
    WebhookReceived = "payment.webhook_received"
}
/**
 * Normalized events from payment provider to internal payment module events. In principle, these should match the payment status.
 */
export declare enum PaymentActions {
    /**
     * Payment session has been authorized and there are available funds for capture.
     */
    AUTHORIZED = "authorized",
    /**
     * Payment was successful and the mount is captured.
     */
    SUCCESSFUL = "captured",
    /**
     * Payment failed.
     */
    FAILED = "failed",
    /**
     * Payment is pending.
     */
    PENDING = "pending",
    /**
     * Payment requires more information.
     */
    REQUIRES_MORE = "requires_more",
    /**
     * Payment was canceled.
     */
    CANCELED = "canceled",
    /**
     * Received an event that is not processable.
     */
    NOT_SUPPORTED = "not_supported"
}
//# sourceMappingURL=webhook.d.ts.map