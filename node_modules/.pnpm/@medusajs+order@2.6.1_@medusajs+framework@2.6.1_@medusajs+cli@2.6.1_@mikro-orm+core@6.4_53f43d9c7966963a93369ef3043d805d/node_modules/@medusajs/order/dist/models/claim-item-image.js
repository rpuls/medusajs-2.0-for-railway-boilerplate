"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderClaimItemImage = void 0;
const utils_1 = require("@medusajs/framework/utils");
const claim_item_1 = require("./claim-item");
const _OrderClaimItemImage = utils_1.model
    .define("OrderClaimItemImage", {
    id: utils_1.model.id({ prefix: "climg" }).primaryKey(),
    claim_item: utils_1.model.belongsTo(() => claim_item_1.OrderClaimItem, {
        mappedBy: "images",
    }),
    url: utils_1.model.text(),
    metadata: utils_1.model.json().nullable(),
})
    .indexes([
    {
        name: "IDX_order_claim_item_image_deleted_at",
        on: ["deleted_at"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_claim_item_image_claim_item_id",
        on: ["claim_item_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
]);
exports.OrderClaimItemImage = _OrderClaimItemImage;
//# sourceMappingURL=claim-item-image.js.map