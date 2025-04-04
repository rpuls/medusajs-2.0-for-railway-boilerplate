"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrievePaymentCollectionTransformQueryConfig = exports.defaultPaymentCollectionFields = void 0;
exports.defaultPaymentCollectionFields = [
    "id",
    "currency_code",
    "amount",
    "*payment_sessions",
];
exports.retrievePaymentCollectionTransformQueryConfig = {
    defaults: exports.defaultPaymentCollectionFields,
    isList: false,
};
//# sourceMappingURL=query-config.js.map