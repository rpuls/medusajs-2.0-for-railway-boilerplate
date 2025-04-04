"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderExchangeItem = void 0;
const utils_1 = require("@medusajs/framework/utils");
const exchange_1 = require("./exchange");
const line_item_1 = require("./line-item");
const _OrderExchangeItem = utils_1.model
    .define("OrderExchangeItem", {
    id: utils_1.model.id({ prefix: "oexcitem" }).primaryKey(),
    quantity: utils_1.model.bigNumber(),
    note: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    exchange: utils_1.model.belongsTo(() => exchange_1.OrderExchange, {
        mappedBy: "additional_items",
    }),
    item: utils_1.model.belongsTo(() => line_item_1.OrderLineItem, {
        mappedBy: "exchange_items",
    }),
})
    .indexes([
    {
        name: "IDX_order_exchange_item_exchange_id",
        on: ["exchange_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_exchange_item_item_id",
        on: ["item_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_exchange_item_deleted_at",
        on: ["deleted_at"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
]);
exports.OrderExchangeItem = _OrderExchangeItem;
//# sourceMappingURL=exchange-item.js.map