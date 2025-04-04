"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderShippingMethodTaxLine = void 0;
const utils_1 = require("@medusajs/framework/utils");
const shipping_method_1 = require("./shipping-method");
const _OrderShippingMethodTaxLine = utils_1.model
    .define({
    tableName: "order_shipping_method_tax_line",
    name: "OrderShippingMethodTaxLine",
}, {
    id: utils_1.model.id({ prefix: "ordsmtxl" }).primaryKey(),
    description: utils_1.model.text().nullable(),
    tax_rate_id: utils_1.model.text().nullable(),
    code: utils_1.model.text(),
    rate: utils_1.model.bigNumber(),
    provider_id: utils_1.model.text().nullable(),
    shipping_method: utils_1.model.belongsTo(() => shipping_method_1.OrderShippingMethod, {
        mappedBy: "tax_lines",
    }),
})
    .indexes([
    {
        name: "IDX_order_shipping_method_tax_line_shipping_method_id",
        on: ["shipping_method_id"],
        unique: false,
    },
]);
exports.OrderShippingMethodTaxLine = _OrderShippingMethodTaxLine;
//# sourceMappingURL=shipping-method-tax-line.js.map