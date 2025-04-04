"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderClaimItem = void 0;
const utils_1 = require("@medusajs/framework/utils");
const claim_1 = require("./claim");
const claim_item_image_1 = require("./claim-item-image");
const line_item_1 = require("./line-item");
const _OrderClaimItem = utils_1.model
    .define("OrderClaimItem", {
    id: utils_1.model.id({ prefix: "claitem" }).primaryKey(),
    reason: utils_1.model.enum(utils_1.ClaimReason).nullable(),
    quantity: utils_1.model.bigNumber(),
    is_additional_item: utils_1.model.boolean().default(false),
    note: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    claim: utils_1.model.belongsTo(() => claim_1.OrderClaim, {
        mappedBy: "additional_items",
    }),
    item: utils_1.model.belongsTo(() => line_item_1.OrderLineItem, {
        mappedBy: "claim_items",
    }),
    images: utils_1.model.hasMany(() => claim_item_image_1.OrderClaimItemImage, {
        mappedBy: "claim_item",
    }),
})
    .cascades({
    delete: ["images"],
})
    .indexes([
    {
        name: "IDX_order_claim_item_claim_id",
        on: ["claim_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_claim_item_item_id",
        on: ["item_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_claim_item_deleted_at",
        on: ["deleted_at"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
]);
exports.OrderClaimItem = _OrderClaimItem;
//# sourceMappingURL=claim-item.js.map