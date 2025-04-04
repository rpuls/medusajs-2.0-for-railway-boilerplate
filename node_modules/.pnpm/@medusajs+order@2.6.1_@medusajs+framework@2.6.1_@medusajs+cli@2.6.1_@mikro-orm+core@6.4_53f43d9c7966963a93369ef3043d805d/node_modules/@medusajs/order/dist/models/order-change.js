"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderChange = void 0;
const utils_1 = require("@medusajs/framework/utils");
const order_1 = require("./order");
const order_change_action_1 = require("./order-change-action");
const _OrderChange = utils_1.model
    .define("OrderChange", {
    id: utils_1.model.id({ prefix: "ordch" }).primaryKey(),
    return_id: utils_1.model.text().nullable(),
    claim_id: utils_1.model.text().nullable(),
    exchange_id: utils_1.model.text().nullable(),
    version: utils_1.model.number(),
    change_type: utils_1.model.text().nullable(),
    description: utils_1.model.text().nullable(),
    status: utils_1.model
        .enum(utils_1.OrderChangeStatus)
        .default(utils_1.OrderChangeStatus.PENDING)
        .nullable(),
    internal_note: utils_1.model.text().nullable(),
    created_by: utils_1.model.text().nullable(),
    requested_by: utils_1.model.text().nullable(),
    requested_at: utils_1.model.dateTime().nullable(),
    confirmed_by: utils_1.model.text().nullable(),
    confirmed_at: utils_1.model.dateTime().nullable(),
    declined_by: utils_1.model.text().nullable(),
    declined_reason: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    declined_at: utils_1.model.dateTime().nullable(),
    canceled_by: utils_1.model.text().nullable(),
    canceled_at: utils_1.model.dateTime().nullable(),
    order: utils_1.model.belongsTo(() => order_1.Order, {
        mappedBy: "changes",
    }),
    actions: utils_1.model.hasMany(() => order_change_action_1.OrderChangeAction),
})
    .cascades({
    delete: ["actions"],
})
    .indexes([
    {
        name: "IDX_order_change_order_id",
        on: ["order_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_change_return_id",
        on: ["return_id"],
        unique: false,
        where: "return_id IS NOT NULL AND deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_change_claim_id",
        on: ["claim_id"],
        unique: false,
        where: "claim_id IS NOT NULL AND deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_change_exchange_id",
        on: ["exchange_id"],
        unique: false,
        where: "exchange_id IS NOT NULL AND deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_change_status",
        on: ["status"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_change_deleted_at",
        on: ["deleted_at"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_change_version",
        on: ["order_id", "version"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
]);
exports.OrderChange = _OrderChange;
//# sourceMappingURL=order-change.js.map