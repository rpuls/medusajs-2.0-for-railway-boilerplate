"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Return = void 0;
const utils_1 = require("@medusajs/framework/utils");
const claim_1 = require("./claim");
const exchange_1 = require("./exchange");
const order_1 = require("./order");
const order_shipping_method_1 = require("./order-shipping-method");
const return_item_1 = require("./return-item");
const transaction_1 = require("./transaction");
const _Return = utils_1.model
    .define("Return", {
    id: utils_1.model.id({ prefix: "return" }).primaryKey(),
    order_version: utils_1.model.number(),
    display_id: utils_1.model.autoincrement(),
    status: utils_1.model.enum(utils_1.ReturnStatus).default(utils_1.ReturnStatus.OPEN),
    location_id: utils_1.model.text().nullable(),
    no_notification: utils_1.model.boolean().nullable(),
    refund_amount: utils_1.model.bigNumber().nullable(),
    created_by: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    requested_at: utils_1.model.dateTime().nullable(),
    received_at: utils_1.model.dateTime().nullable(),
    canceled_at: utils_1.model.dateTime().nullable(),
    order: utils_1.model.belongsTo(() => order_1.Order, {
        mappedBy: "returns",
    }),
    exchange: utils_1.model
        .hasOne(() => exchange_1.OrderExchange, {
        mappedBy: undefined,
        foreignKey: true,
    })
        .nullable(),
    claim: utils_1.model
        .hasOne(() => claim_1.OrderClaim, {
        mappedBy: undefined,
        foreignKey: true,
    })
        .nullable(),
    items: utils_1.model.hasMany(() => return_item_1.ReturnItem, {
        mappedBy: "return",
    }),
    shipping_methods: utils_1.model.hasMany(() => order_shipping_method_1.OrderShipping, {
        mappedBy: "return",
    }),
    transactions: utils_1.model.hasMany(() => transaction_1.OrderTransaction, {
        mappedBy: "return",
    }),
})
    .cascades({
    delete: ["items", "shipping_methods", "transactions"],
})
    .indexes([
    {
        name: "IDX_return_display_id",
        on: ["display_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_return_deleted_at",
        on: ["deleted_at"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_return_order_id",
        on: ["order_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_return_exchange_id",
        on: ["exchange_id"],
        unique: false,
        where: "exchange_id IS NOT NULL AND deleted_at IS NOT NULL",
    },
    {
        name: "IDX_return_claim_id",
        on: ["claim_id"],
        unique: false,
        where: "claim_id IS NOT NULL AND deleted_at IS NOT NULL",
    },
]);
exports.Return = _Return;
//# sourceMappingURL=return.js.map