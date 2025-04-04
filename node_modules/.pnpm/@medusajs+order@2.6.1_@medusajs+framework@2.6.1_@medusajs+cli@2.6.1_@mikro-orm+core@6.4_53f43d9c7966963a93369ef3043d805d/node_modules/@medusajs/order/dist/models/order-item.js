"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = void 0;
const utils_1 = require("@medusajs/framework/utils");
const line_item_1 = require("./line-item");
const order_1 = require("./order");
const _OrderItem = utils_1.model
    .define("OrderItem", {
    id: utils_1.model.id({ prefix: "orditem" }).primaryKey(),
    version: utils_1.model.number().default(1),
    unit_price: utils_1.model.bigNumber().nullable(),
    compare_at_unit_price: utils_1.model.bigNumber().nullable(),
    quantity: utils_1.model.bigNumber(),
    fulfilled_quantity: utils_1.model.bigNumber().default(0),
    delivered_quantity: utils_1.model.bigNumber().default(0),
    shipped_quantity: utils_1.model.bigNumber().default(0),
    return_requested_quantity: utils_1.model.bigNumber().default(0),
    return_received_quantity: utils_1.model.bigNumber().default(0),
    return_dismissed_quantity: utils_1.model.bigNumber().default(0),
    written_off_quantity: utils_1.model.bigNumber().default(0),
    metadata: utils_1.model.json().nullable(),
    order: utils_1.model.belongsTo(() => order_1.Order, {
        mappedBy: "items",
    }),
    item: utils_1.model.hasOne(() => line_item_1.OrderLineItem, {
        mappedBy: undefined,
        foreignKey: true,
    }),
})
    .indexes([
    {
        name: "IDX_order_item_order_id",
        on: ["order_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_item_version",
        on: ["version"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_item_item_id",
        on: ["item_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_item_deleted_at",
        on: ["deleted_at"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
]);
exports.OrderItem = _OrderItem;
//# sourceMappingURL=order-item.js.map