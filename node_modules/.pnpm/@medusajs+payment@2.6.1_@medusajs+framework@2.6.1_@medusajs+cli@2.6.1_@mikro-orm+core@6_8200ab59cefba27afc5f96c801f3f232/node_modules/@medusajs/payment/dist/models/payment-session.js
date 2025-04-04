"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const payment_1 = __importDefault(require("./payment"));
const payment_collection_1 = __importDefault(require("./payment-collection"));
const PaymentSession = utils_1.model
    .define("PaymentSession", {
    id: utils_1.model.id({ prefix: "payses" }).primaryKey(),
    currency_code: utils_1.model.text(),
    amount: utils_1.model.bigNumber(),
    provider_id: utils_1.model.text(),
    data: utils_1.model.json().default({}),
    context: utils_1.model.json().nullable(),
    status: utils_1.model
        .enum(utils_1.PaymentSessionStatus)
        .default(utils_1.PaymentSessionStatus.PENDING),
    authorized_at: utils_1.model.dateTime().nullable(),
    payment_collection: utils_1.model.belongsTo(() => payment_collection_1.default, {
        mappedBy: "payment_sessions",
    }),
    payment: utils_1.model
        .hasOne(() => payment_1.default, {
        mappedBy: "payment_session",
    })
        .nullable(),
    metadata: utils_1.model.json().nullable(),
})
    .indexes([
    {
        name: "IDX_payment_session_payment_collection_id",
        on: ["payment_collection_id"],
    },
]);
exports.default = PaymentSession;
//# sourceMappingURL=payment-session.js.map