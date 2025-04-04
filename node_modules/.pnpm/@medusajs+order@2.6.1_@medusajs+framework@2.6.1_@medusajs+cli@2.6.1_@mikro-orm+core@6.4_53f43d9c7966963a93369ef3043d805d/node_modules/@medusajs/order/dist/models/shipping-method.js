"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderShippingMethod = void 0;
const utils_1 = require("@medusajs/framework/utils");
const shipping_method_adjustment_1 = require("./shipping-method-adjustment");
const shipping_method_tax_line_1 = require("./shipping-method-tax-line");
const _OrderShippingMethod = utils_1.model
    .define("OrderShippingMethod", {
    id: utils_1.model.id({ prefix: "ordsm" }).primaryKey(),
    name: utils_1.model.text(),
    description: utils_1.model.json().nullable(),
    amount: utils_1.model.bigNumber(),
    is_tax_inclusive: utils_1.model.boolean().default(false),
    is_custom_amount: utils_1.model.boolean().default(false),
    shipping_option_id: utils_1.model.text().nullable(),
    data: utils_1.model.json().nullable(),
    metadata: utils_1.model.json().nullable(),
    tax_lines: utils_1.model.hasMany(() => shipping_method_tax_line_1.OrderShippingMethodTaxLine, {
        mappedBy: "shipping_method",
    }),
    adjustments: utils_1.model.hasMany(() => shipping_method_adjustment_1.OrderShippingMethodAdjustment, {
        mappedBy: "shipping_method",
    }),
})
    .cascades({
    delete: ["tax_lines", "adjustments"],
})
    .indexes([
    {
        name: "IDX_order_shipping_method_shipping_option_id",
        on: ["shipping_option_id"],
        unique: false,
    },
]);
exports.OrderShippingMethod = _OrderShippingMethod;
//# sourceMappingURL=shipping-method.js.map