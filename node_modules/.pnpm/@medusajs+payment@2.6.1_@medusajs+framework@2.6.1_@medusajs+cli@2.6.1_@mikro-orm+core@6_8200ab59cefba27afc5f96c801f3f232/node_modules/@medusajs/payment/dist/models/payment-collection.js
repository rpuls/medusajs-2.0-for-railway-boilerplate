"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const payment_1 = __importDefault(require("./payment"));
const payment_provider_1 = __importDefault(require("./payment-provider"));
const payment_session_1 = __importDefault(require("./payment-session"));
const PaymentCollection = utils_1.model
    .define("PaymentCollection", {
    id: utils_1.model.id({ prefix: "pay_col" }).primaryKey(),
    currency_code: utils_1.model.text(),
    amount: utils_1.model.bigNumber(),
    authorized_amount: utils_1.model.bigNumber().nullable(),
    captured_amount: utils_1.model.bigNumber().nullable(),
    refunded_amount: utils_1.model.bigNumber().nullable(),
    completed_at: utils_1.model.dateTime().nullable(),
    status: utils_1.model
        .enum(utils_1.PaymentCollectionStatus)
        .default(utils_1.PaymentCollectionStatus.NOT_PAID),
    metadata: utils_1.model.json().nullable(),
    payment_providers: utils_1.model.manyToMany(() => payment_provider_1.default, {
        mappedBy: "payment_collections",
    }),
    payment_sessions: utils_1.model.hasMany(() => payment_session_1.default, {
        mappedBy: "payment_collection",
    }),
    payments: utils_1.model.hasMany(() => payment_1.default, {
        mappedBy: "payment_collection",
    }),
})
    .cascades({
    delete: ["payment_sessions", "payments"],
});
exports.default = PaymentCollection;
//# sourceMappingURL=payment-collection.js.map