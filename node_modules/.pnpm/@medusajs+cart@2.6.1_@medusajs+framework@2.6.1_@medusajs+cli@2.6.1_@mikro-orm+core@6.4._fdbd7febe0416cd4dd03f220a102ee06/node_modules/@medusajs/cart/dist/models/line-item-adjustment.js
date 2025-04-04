"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const line_item_1 = __importDefault(require("./line-item"));
const LineItemAdjustment = utils_1.model
    .define({ name: "LineItemAdjustment", tableName: "cart_line_item_adjustment" }, {
    id: utils_1.model.id({ prefix: "caliadj" }).primaryKey(),
    description: utils_1.model.text().nullable(),
    code: utils_1.model.text().nullable(),
    amount: utils_1.model.bigNumber(),
    provider_id: utils_1.model.text().nullable(),
    promotion_id: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    item: utils_1.model.belongsTo(() => line_item_1.default, {
        mappedBy: "adjustments",
    }),
})
    .indexes([
    {
        name: "IDX_line_item_adjustment_promotion_id",
        on: ["promotion_id"],
        where: "deleted_at IS NULL AND promotion_id IS NOT NULL",
    },
    {
        name: "IDX_adjustment_item_id",
        on: ["item_id"],
        where: "deleted_at IS NULL",
    },
])
    .checks([(columns) => `${columns.amount} >= 0`]);
exports.default = LineItemAdjustment;
//# sourceMappingURL=line-item-adjustment.js.map