"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnItem = void 0;
const utils_1 = require("@medusajs/framework/utils");
const line_item_1 = require("./line-item");
const return_1 = require("./return");
const return_reason_1 = require("./return-reason");
const _ReturnItem = utils_1.model
    .define({
    name: "ReturnItem",
    tableName: "return_item",
}, {
    id: utils_1.model.id({ prefix: "retitem" }).primaryKey(),
    quantity: utils_1.model.bigNumber(),
    received_quantity: utils_1.model.bigNumber().default(0),
    damaged_quantity: utils_1.model.bigNumber().default(0),
    note: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    reason: utils_1.model
        .belongsTo(() => return_reason_1.ReturnReason, {
        mappedBy: "return_items",
    })
        .nullable(),
    return: utils_1.model.belongsTo(() => return_1.Return, {
        mappedBy: "items",
    }),
    item: utils_1.model.belongsTo(() => line_item_1.OrderLineItem, {
        mappedBy: "return_items",
    }),
})
    .indexes([
    {
        name: "IDX_return_item_return_id",
        on: ["return_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_return_item_reason_id",
        on: ["reason_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_return_item_item_id",
        on: ["item_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_return_item_deleted_at",
        on: ["deleted_at"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
]);
exports.ReturnItem = _ReturnItem;
//# sourceMappingURL=return-item.js.map