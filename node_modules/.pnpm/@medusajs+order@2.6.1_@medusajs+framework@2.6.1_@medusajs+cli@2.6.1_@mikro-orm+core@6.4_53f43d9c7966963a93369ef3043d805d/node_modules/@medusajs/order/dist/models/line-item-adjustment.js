"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderLineItemAdjustment = void 0;
const utils_1 = require("@medusajs/framework/utils");
const line_item_1 = require("./line-item");
const _OrderLineItemAdjustment = utils_1.model
    .define("OrderLineItemAdjustment", {
    id: utils_1.model.id({ prefix: "ordliadj" }).primaryKey(),
    description: utils_1.model.text().nullable(),
    promotion_id: utils_1.model.text().nullable(),
    code: utils_1.model.text().nullable(),
    amount: utils_1.model.bigNumber(),
    provider_id: utils_1.model.text().nullable(),
    item: utils_1.model.belongsTo(() => line_item_1.OrderLineItem, {
        mappedBy: "adjustments",
    }),
})
    .indexes([
    {
        name: "IDX_order_order_line_item_adjustment_item_id",
        on: ["item_id"],
        unique: false,
    },
]);
exports.OrderLineItemAdjustment = _OrderLineItemAdjustment;
//# sourceMappingURL=line-item-adjustment.js.map