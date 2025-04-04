"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentActions = exports.PaymentWebhookEvents = void 0;
var PaymentWebhookEvents;
(function (PaymentWebhookEvents) {
    PaymentWebhookEvents["WebhookReceived"] = "payment.webhook_received";
})(PaymentWebhookEvents || (exports.PaymentWebhookEvents = PaymentWebhookEvents = {}));
/**
 * Normalized events from payment provider to internal payment module events. In principle, these should match the payment status.
 */
var PaymentActions;
(function (PaymentActions) {
    /**
     * Payment session has been authorized and there are available funds for capture.
     */
    PaymentActions["AUTHORIZED"] = "authorized";
    /**
     * Payment was successful and the mount is captured.
     */
    PaymentActions["SUCCESSFUL"] = "captured";
    /**
     * Payment failed.
     */
    PaymentActions["FAILED"] = "failed";
    /**
     * Payment is pending.
     */
    PaymentActions["PENDING"] = "pending";
    /**
     * Payment requires more information.
     */
    PaymentActions["REQUIRES_MORE"] = "requires_more";
    /**
     * Payment was canceled.
     */
    PaymentActions["CANCELED"] = "canceled";
    /**
     * Received an event that is not processable.
     */
    PaymentActions["NOT_SUPPORTED"] = "not_supported";
})(PaymentActions || (exports.PaymentActions = PaymentActions = {}));
//# sourceMappingURL=webhook.js.map