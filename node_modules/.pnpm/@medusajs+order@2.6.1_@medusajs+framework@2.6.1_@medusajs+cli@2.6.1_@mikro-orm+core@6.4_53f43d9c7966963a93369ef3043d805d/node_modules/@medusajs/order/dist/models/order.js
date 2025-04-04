"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const utils_1 = require("@medusajs/framework/utils");
const address_1 = require("./address");
const credit_line_1 = require("./credit-line");
const order_item_1 = require("./order-item");
const order_shipping_method_1 = require("./order-shipping-method");
const order_summary_1 = require("./order-summary");
const transaction_1 = require("./transaction");
const _models_1 = require(".");
const _Order = utils_1.model
    .define("Order", {
    id: utils_1.model.id({ prefix: "order" }).primaryKey(),
    display_id: utils_1.model.autoincrement(),
    region_id: utils_1.model.text().nullable(),
    customer_id: utils_1.model.text().nullable(),
    version: utils_1.model.number().default(1),
    sales_channel_id: utils_1.model.text().nullable(),
    status: utils_1.model.enum(utils_1.OrderStatus).default(utils_1.OrderStatus.PENDING),
    is_draft_order: utils_1.model.boolean().default(false),
    email: utils_1.model.text().searchable().nullable(),
    currency_code: utils_1.model.text(),
    no_notification: utils_1.model.boolean().nullable(),
    metadata: utils_1.model.json().nullable(),
    canceled_at: utils_1.model.dateTime().nullable(),
    shipping_address: utils_1.model
        .hasOne(() => address_1.OrderAddress, {
        mappedBy: undefined,
        foreignKey: true,
    })
        .nullable(),
    billing_address: utils_1.model
        .hasOne(() => address_1.OrderAddress, {
        mappedBy: undefined,
        foreignKey: true,
    })
        .nullable(),
    summary: utils_1.model.hasMany(() => order_summary_1.OrderSummary, {
        mappedBy: "order",
    }),
    items: utils_1.model.hasMany(() => order_item_1.OrderItem, {
        mappedBy: "order",
    }),
    shipping_methods: utils_1.model.hasMany(() => order_shipping_method_1.OrderShipping, {
        mappedBy: "order",
    }),
    transactions: utils_1.model.hasMany(() => transaction_1.OrderTransaction, {
        mappedBy: "order",
    }),
    credit_lines: utils_1.model.hasMany(() => credit_line_1.OrderCreditLine, {
        mappedBy: "order",
    }),
    returns: utils_1.model.hasMany(() => _models_1.Return, {
        mappedBy: "order",
    }),
})
    .cascades({
    delete: ["summary", "items", "shipping_methods", "transactions"],
})
    .indexes([
    {
        name: "IDX_order_display_id",
        on: ["display_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_region_id",
        on: ["region_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_customer_id",
        on: ["customer_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_sales_channel_id",
        on: ["sales_channel_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_deleted_at",
        on: ["deleted_at"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_currency_code",
        on: ["currency_code"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_shipping_address_id",
        on: ["shipping_address_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_billing_address_id",
        on: ["billing_address_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_is_draft_order",
        on: ["is_draft_order"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
]);
exports.Order = _Order;
//# sourceMappingURL=order.js.map