"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderClaim = void 0;
const utils_1 = require("@medusajs/framework/utils");
const claim_item_1 = require("./claim-item");
const order_1 = require("./order");
const order_shipping_method_1 = require("./order-shipping-method");
const return_1 = require("./return");
const transaction_1 = require("./transaction");
const _OrderClaim = utils_1.model
    .define("OrderClaim", {
    id: utils_1.model.id({ prefix: "claim" }).primaryKey(),
    order_version: utils_1.model.number(),
    display_id: utils_1.model.autoincrement(),
    type: utils_1.model.enum(utils_1.ClaimType),
    no_notification: utils_1.model.boolean().nullable(),
    refund_amount: utils_1.model.bigNumber().nullable(),
    created_by: utils_1.model.text().nullable(),
    canceled_at: utils_1.model.dateTime().nullable(),
    metadata: utils_1.model.json().nullable(),
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
    additional_items: utils_1.model.hasMany(() => claim_item_1.OrderClaimItem, {
        mappedBy: "claim",
    }),
    claim_items: utils_1.model.hasMany(() => claim_item_1.OrderClaimItem, {
        mappedBy: "claim",
    }),
    shipping_methods: utils_1.model.hasMany(() => order_shipping_method_1.OrderShipping, {
        mappedBy: "claim",
    }),
    transactions: utils_1.model.hasMany(() => transaction_1.OrderTransaction, {
        mappedBy: "claim",
    }),
})
    .cascades({
    delete: ["additional_items", "claim_items", "transactions"],
})
    .indexes([
    {
        name: "IDX_order_claim_display_id",
        on: ["display_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_claim_deleted_at",
        on: ["deleted_at"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_claim_order_id",
        on: ["order_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_claim_return_id",
        on: ["return_id"],
        unique: false,
        where: "return_id IS NOT NULL AND deleted_at IS NOT NULL",
    },
]);
exports.OrderClaim = _OrderClaim;
//# sourceMappingURL=claim.js.map