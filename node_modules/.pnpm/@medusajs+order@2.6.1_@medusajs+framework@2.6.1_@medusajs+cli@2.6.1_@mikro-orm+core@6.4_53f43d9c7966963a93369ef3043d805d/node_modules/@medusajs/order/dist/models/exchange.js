"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderExchange = void 0;
const utils_1 = require("@medusajs/framework/utils");
const exchange_item_1 = require("./exchange-item");
const order_1 = require("./order");
const order_shipping_method_1 = require("./order-shipping-method");
const return_1 = require("./return");
const transaction_1 = require("./transaction");
const _OrderExchange = utils_1.model
    .define("OrderExchange", {
    id: utils_1.model.id({ prefix: "oexc" }).primaryKey(),
    order_version: utils_1.model.number(),
    display_id: utils_1.model.autoincrement(),
    no_notification: utils_1.model.boolean().nullable(),
    difference_due: utils_1.model.bigNumber().nullable(),
    allow_backorder: utils_1.model.boolean().default(false),
    created_by: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    canceled_at: utils_1.model.dateTime().nullable(),
    order: utils_1.model.hasOne(() => order_1.Order, {
        mappedBy: undefined,
        foreignKey: true,
    }),
    return: utils_1.model
        .hasOne(() => return_1.Return, {
        mappedBy: undefined,
        foreignKey: true,
    })
        .nullable(),
    additional_items: utils_1.model.hasMany(() => exchange_item_1.OrderExchangeItem, {
        mappedBy: "exchange",
    }),
    shipping_methods: utils_1.model.hasMany(() => order_shipping_method_1.OrderShipping, {
        mappedBy: "exchange",
    }),
    transactions: utils_1.model.hasMany(() => transaction_1.OrderTransaction, {
        mappedBy: "exchange",
    }),
})
    .cascades({
    delete: ["additional_items", "transactions"],
})
    .indexes([
    {
        name: "IDX_order_exchange_display_id",
        on: ["display_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_exchange_deleted_at",
        on: ["deleted_at"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_exchange_order_id",
        on: ["order_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_exchange_return_id",
        on: ["return_id"],
        unique: false,
        where: "return_id IS NOT NULL AND deleted_at IS NOT NULL",
    },
]);
exports.OrderExchange = _OrderExchange;
//# sourceMappingURL=exchange.js.map