"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrievePaymentCollectionTransformQueryConfig = exports.defaultPaymentCollectionFields = void 0;
exports.defaultPaymentCollectionFields = [
    "id",
    "currency_code",
    "amount",
    "status",
    "authorized_amount",
    "captured_amount",
    "refunded_amount",
    "*payment_sessions",
    "*payments",
];
exports.retrievePaymentCollectionTransformQueryConfig = {
    defaults: exports.defaultPaymentCollectionFields,
    isList: false,
};
//# sourceMappingURL=query-config.js.map