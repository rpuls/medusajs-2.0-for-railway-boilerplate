"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const shipping_method_1 = __importDefault(require("./shipping-method"));
const ShippingMethodTaxLine = utils_1.model
    .define({
    name: "ShippingMethodTaxLine",
    tableName: "cart_shipping_method_tax_line",
}, {
    id: utils_1.model.id({ prefix: "casmtxl" }).primaryKey(),
    description: utils_1.model.text().nullable(),
    code: utils_1.model.text(),
    rate: utils_1.model.float(),
    provider_id: utils_1.model.text().nullable(),
    tax_rate_id: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    shipping_method: utils_1.model.belongsTo(() => shipping_method_1.default, {
        mappedBy: "tax_lines",
    }),
})
    .indexes([
    {
        name: "IDX_tax_line_shipping_method_id",
        on: ["shipping_method_id"],
        where: "deleted_at IS NULL",
    },
    {
        name: "IDX_shipping_method_tax_line_tax_rate_id",
        on: ["tax_rate_id"],
        where: "deleted_at IS NULL AND tax_rate_id IS NOT NULL",
    },
]);
exports.default = ShippingMethodTaxLine;
//# sourceMappingURL=shipping-method-tax-line.js.map