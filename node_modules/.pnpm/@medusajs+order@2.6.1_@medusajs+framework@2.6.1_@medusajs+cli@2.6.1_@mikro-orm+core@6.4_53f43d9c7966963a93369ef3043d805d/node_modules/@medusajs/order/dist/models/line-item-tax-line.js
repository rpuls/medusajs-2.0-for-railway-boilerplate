"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderLineItemTaxLine = void 0;
const utils_1 = require("@medusajs/framework/utils");
const line_item_1 = require("./line-item");
const _OrderLineItemTaxLine = utils_1.model
    .define("OrderLineItemTaxLine", {
    id: utils_1.model.id({ prefix: "ordlitxl" }).primaryKey(),
    description: utils_1.model.text().nullable(),
    tax_rate_id: utils_1.model.text().nullable(),
    code: utils_1.model.text(),
    rate: utils_1.model.bigNumber(),
    provider_id: utils_1.model.text().nullable(),
    item: utils_1.model.belongsTo(() => line_item_1.OrderLineItem, {
        mappedBy: "tax_lines",
    }),
})
    .indexes([
    {
        name: "IDX_order_line_item_tax_line_item_id",
        on: ["item_id"],
        unique: false,
    },
]);
exports.OrderLineItemTaxLine = _OrderLineItemTaxLine;
//# sourceMappingURL=line-item-tax-line.js.map