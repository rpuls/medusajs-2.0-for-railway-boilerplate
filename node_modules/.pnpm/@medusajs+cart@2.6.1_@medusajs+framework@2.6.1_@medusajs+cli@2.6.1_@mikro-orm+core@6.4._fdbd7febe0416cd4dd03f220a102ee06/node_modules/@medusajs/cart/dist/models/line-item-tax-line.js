"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const line_item_1 = __importDefault(require("./line-item"));
const LineItemTaxLine = utils_1.model
    .define({
    name: "LineItemTaxLine",
    tableName: "cart_line_item_tax_line",
}, {
    id: utils_1.model.id({ prefix: "calitxl" }).primaryKey(),
    description: utils_1.model.text().nullable(),
    code: utils_1.model.text(),
    rate: utils_1.model.float(),
    provider_id: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    tax_rate_id: utils_1.model.text().nullable(),
    item: utils_1.model.belongsTo(() => line_item_1.default, {
        mappedBy: "tax_lines",
    }),
})
    .indexes([
    {
        name: "IDX_line_item_tax_line_tax_rate_id",
        on: ["tax_rate_id"],
        where: "deleted_at IS NULL AND tax_rate_id IS NOT NULL",
    },
    {
        name: "IDX_tax_line_item_id",
        on: ["item_id"],
        where: "deleted_at IS NULL",
    },
]);
exports.default = LineItemTaxLine;
//# sourceMappingURL=line-item-tax-line.js.map