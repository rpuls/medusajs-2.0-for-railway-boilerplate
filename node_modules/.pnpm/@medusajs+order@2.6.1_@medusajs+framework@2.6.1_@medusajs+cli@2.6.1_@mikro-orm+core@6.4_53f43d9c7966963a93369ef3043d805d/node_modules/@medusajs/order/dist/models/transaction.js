"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderTransaction = void 0;
const utils_1 = require("@medusajs/framework/utils");
const claim_1 = require("./claim");
const exchange_1 = require("./exchange");
const order_1 = require("./order");
const return_1 = require("./return");
const _OrderTransaction = utils_1.model
    .define("OrderTransaction", {
    id: utils_1.model.id({ prefix: "ordtrx" }).primaryKey(),
    version: utils_1.model.number().default(1),
    amount: utils_1.model.bigNumber(),
    currency_code: utils_1.model.text(),
    reference: utils_1.model.text().nullable(),
    reference_id: utils_1.model.text().nullable(),
    order: utils_1.model.belongsTo(() => order_1.Order, {
        mappedBy: "transactions",
    }),
    return: utils_1.model
        .belongsTo(() => return_1.Return, {
        mappedBy: "transactions",
    })
        .nullable(),
    exchange: utils_1.model
        .belongsTo(() => exchange_1.OrderExchange, {
        mappedBy: "transactions",
    })
        .nullable(),
    claim: utils_1.model
        .belongsTo(() => claim_1.OrderClaim, {
        mappedBy: "transactions",
    })
        .nullable(),
})
    .indexes([
    {
        name: "IDX_order_transaction_reference_id",
        on: ["reference_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_transaction_order_id",
        on: ["order_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_transaction_return_id",
        on: ["return_id"],
        unique: false,
        where: "return_id IS NOT NULL AND deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_transaction_exchange_id",
        on: ["exchange_id"],
        unique: false,
        where: "exchange_id IS NOT NULL AND deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_transaction_claim_id",
        on: ["claim_id"],
        unique: false,
        where: "claim_id IS NOT NULL AND deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_transaction_currency_code",
        on: ["currency_code"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_transaction_deleted_at",
        on: ["deleted_at"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_transaction_order_id_version",
        on: ["order_id", "version"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
]);
exports.OrderTransaction = _OrderTransaction;
//# sourceMappingURL=transaction.js.map