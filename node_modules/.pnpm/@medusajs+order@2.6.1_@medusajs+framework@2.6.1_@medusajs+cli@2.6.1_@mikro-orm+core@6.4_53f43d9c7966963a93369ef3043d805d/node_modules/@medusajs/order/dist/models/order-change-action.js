"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderChangeAction = void 0;
const utils_1 = require("@medusajs/framework/utils");
const order_change_1 = require("./order-change");
const _OrderChangeAction = utils_1.model
    .define("OrderChangeAction", {
    id: utils_1.model.id({ prefix: "ordchact" }).primaryKey(),
    order_id: utils_1.model.text(),
    return_id: utils_1.model.text().nullable(),
    claim_id: utils_1.model.text().nullable(),
    exchange_id: utils_1.model.text().nullable(),
    ordering: utils_1.model.autoincrement(),
    version: utils_1.model.number().nullable(),
    reference: utils_1.model.text().nullable(),
    reference_id: utils_1.model.text().nullable(),
    action: utils_1.model.text(),
    details: utils_1.model.json().default({}),
    amount: utils_1.model.bigNumber().nullable(),
    internal_note: utils_1.model.text().nullable(),
    applied: utils_1.model.boolean().default(false),
    order_change: utils_1.model
        .belongsTo(() => order_change_1.OrderChange, {
        mappedBy: "actions",
    })
        .nullable(),
})
    .indexes([
    {
        name: "IDX_order_change_action_order_change_id",
        on: ["order_change_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_change_action_order_id",
        on: ["order_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_change_action_return_id",
        on: ["return_id"],
        unique: false,
        where: "return_id IS NOT NULL AND deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_change_action_claim_id",
        on: ["claim_id"],
        unique: false,
        where: "claim_id IS NOT NULL AND deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_change_action_exchange_id",
        on: ["exchange_id"],
        unique: false,
        where: "exchange_id IS NOT NULL AND deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_change_action_deleted_at",
        on: ["deleted_at"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_change_action_ordering",
        on: ["ordering"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
]);
exports.OrderChangeAction = _OrderChangeAction;
//# sourceMappingURL=order-change-action.js.map