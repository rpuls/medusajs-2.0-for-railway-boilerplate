"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const cart_1 = __importDefault(require("./cart"));
const shipping_method_adjustment_1 = __importDefault(require("./shipping-method-adjustment"));
const shipping_method_tax_line_1 = __importDefault(require("./shipping-method-tax-line"));
const ShippingMethod = utils_1.model
    .define({
    name: "ShippingMethod",
    tableName: "cart_shipping_method",
}, {
    id: utils_1.model.id({ prefix: "casm" }).primaryKey(),
    name: utils_1.model.text(),
    description: utils_1.model.json().nullable(),
    amount: utils_1.model.bigNumber(),
    is_tax_inclusive: utils_1.model.boolean().default(false),
    shipping_option_id: utils_1.model.text().nullable(),
    data: utils_1.model.json().nullable(),
    metadata: utils_1.model.json().nullable(),
    cart: utils_1.model.belongsTo(() => cart_1.default, {
        mappedBy: "shipping_methods",
    }),
    tax_lines: utils_1.model.hasMany(() => shipping_method_tax_line_1.default, {
        mappedBy: "shipping_method",
    }),
    adjustments: utils_1.model.hasMany(() => shipping_method_adjustment_1.default, {
        mappedBy: "shipping_method",
    }),
})
    .indexes([
    {
        name: "IDX_shipping_method_cart_id",
        on: ["cart_id"],
        where: "deleted_at IS NULL",
    },
    {
        name: "IDX_shipping_method_option_id",
        on: ["shipping_option_id"],
        where: "deleted_at IS NULL AND shipping_option_id IS NOT NULL",
    },
])
    .checks([(columns) => `${columns.amount} >= 0`]);
exports.default = ShippingMethod;
//# sourceMappingURL=shipping-method.js.map