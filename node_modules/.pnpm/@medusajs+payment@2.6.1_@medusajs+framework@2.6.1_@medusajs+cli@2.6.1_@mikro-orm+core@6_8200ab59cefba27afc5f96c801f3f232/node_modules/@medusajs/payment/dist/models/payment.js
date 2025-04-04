"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const capture_1 = __importDefault(require("./capture"));
const payment_collection_1 = __importDefault(require("./payment-collection"));
const payment_session_1 = __importDefault(require("./payment-session"));
const refund_1 = __importDefault(require("./refund"));
// TODO: We should remove the `Payment` model and use the `PaymentSession` model instead.
// We just need to move the refunds, captures, canceled_at, and captured_at to it.
const Payment = utils_1.model
    .define("Payment", {
    id: utils_1.model.id({ prefix: "pay" }).primaryKey(),
    amount: utils_1.model.bigNumber(),
    currency_code: utils_1.model.text(),
    provider_id: utils_1.model.text(),
    data: utils_1.model.json().nullable(),
    metadata: utils_1.model.json().nullable(),
    captured_at: utils_1.model.dateTime().nullable(),
    canceled_at: utils_1.model.dateTime().nullable(),
    payment_collection: utils_1.model.belongsTo(() => payment_collection_1.default, {
        mappedBy: "payments",
    }),
    payment_session: utils_1.model.belongsTo(() => payment_session_1.default, {
        mappedBy: "payment",
    }),
    refunds: utils_1.model.hasMany(() => refund_1.default, {
        mappedBy: "payment",
    }),
    captures: utils_1.model.hasMany(() => capture_1.default, {
        mappedBy: "payment",
    }),
})
    .cascades({
    delete: ["refunds", "captures"],
})
    .indexes([
    {
        name: "IDX_payment_provider_id",
        on: ["provider_id"],
    },
    {
        name: "IDX_payment_payment_collection_id",
        on: ["payment_collection_id"],
    },
    {
        name: "IDX_payment_payment_session_id",
        on: ["payment_session_id"],
    },
]);
exports.default = Payment;
//# sourceMappingURL=payment.js.map