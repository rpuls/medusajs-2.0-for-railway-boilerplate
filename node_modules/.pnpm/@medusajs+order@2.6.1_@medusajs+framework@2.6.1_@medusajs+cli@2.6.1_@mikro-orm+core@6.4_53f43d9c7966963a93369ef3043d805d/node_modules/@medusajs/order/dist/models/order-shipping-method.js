"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderShipping = void 0;
const utils_1 = require("@medusajs/framework/utils");
const claim_1 = require("./claim");
const exchange_1 = require("./exchange");
const order_1 = require("./order");
const return_1 = require("./return");
const shipping_method_1 = require("./shipping-method");
const _OrderShipping = utils_1.model
    .define("OrderShipping", {
    id: utils_1.model.id({ prefix: "ordspmv" }).primaryKey(),
    version: utils_1.model.number().default(1),
    order: utils_1.model.belongsTo(() => order_1.Order, {
        mappedBy: "shipping_methods",
    }),
    return: utils_1.model
        .belongsTo(() => return_1.Return, {
        mappedBy: "shipping_methods",
    })
        .nullable(),
    exchange: utils_1.model
        .belongsTo(() => exchange_1.OrderExchange, {
        mappedBy: "shipping_methods",
    })
        .nullable(),
    claim: utils_1.model
        .belongsTo(() => claim_1.OrderClaim, {
        mappedBy: "shipping_methods",
    })
        .nullable(),
    shipping_method: utils_1.model.hasOne(() => shipping_method_1.OrderShippingMethod, {
        mappedBy: undefined,
        foreignKey: true,
    }),
})
    .indexes([
    {
        name: "IDX_order_shipping_order_id",
        on: ["order_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_shipping_return_id",
        on: ["return_id"],
        unique: false,
        where: "return_id IS NOT NULL AND deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_shipping_exchange_id",
        on: ["exchange_id"],
        unique: false,
        where: "exchange_id IS NOT NULL AND deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_shipping_claim_id",
        on: ["claim_id"],
        unique: false,
        where: "claim_id IS NOT NULL AND deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_shipping_version",
        on: ["version"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_shipping_shipping_method_id",
        on: ["shipping_method_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_shipping_deleted_at",
        on: ["deleted_at"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
]);
exports.OrderShipping = _OrderShipping;
//# sourceMappingURL=order-shipping-method.js.map