"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProviderKeys = exports.ErrorIntentStatus = exports.ErrorCodes = void 0;
exports.ErrorCodes = {
    PAYMENT_INTENT_UNEXPECTED_STATE: "payment_intent_unexpected_state",
};
exports.ErrorIntentStatus = {
    SUCCEEDED: "succeeded",
    CANCELED: "canceled",
};
exports.PaymentProviderKeys = {
    STRIPE: "stripe",
    BAN_CONTACT: "stripe-bancontact",
    BLIK: "stripe-blik",
    GIROPAY: "stripe-giropay",
    IDEAL: "stripe-ideal",
    PRZELEWY_24: "stripe-przelewy24",
    PROMPT_PAY: "stripe-promptpay",
};
//# sourceMappingURL=index.js.map