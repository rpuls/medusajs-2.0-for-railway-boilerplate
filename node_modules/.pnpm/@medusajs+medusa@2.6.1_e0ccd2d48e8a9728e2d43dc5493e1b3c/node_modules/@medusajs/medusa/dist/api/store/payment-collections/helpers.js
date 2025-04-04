"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchPaymentCollection = void 0;
const http_1 = require("@medusajs/framework/http");
const refetchPaymentCollection = async (id, scope, fields) => {
    return (0, http_1.refetchEntity)("payment_collection", id, scope, fields);
};
exports.refetchPaymentCollection = refetchPaymentCollection;
//# sourceMappingURL=helpers.js.map