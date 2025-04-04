"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const address_1 = __importDefault(require("./address"));
const credit_line_1 = __importDefault(require("./credit-line"));
const line_item_1 = __importDefault(require("./line-item"));
const shipping_method_1 = __importDefault(require("./shipping-method"));
const Cart = utils_1.model
    .define("Cart", {
    id: utils_1.model.id({ prefix: "cart" }).primaryKey(),
    region_id: utils_1.model.text().nullable(),
    customer_id: utils_1.model.text().nullable(),
    sales_channel_id: utils_1.model.text().nullable(),
    email: utils_1.model.text().nullable(),
    currency_code: utils_1.model.text(),
    metadata: utils_1.model.json().nullable(),
    completed_at: utils_1.model.dateTime().nullable(),
    shipping_address: utils_1.model
        .hasOne(() => address_1.default, {
        mappedBy: undefined,
        foreignKey: true,
    })
        .nullable(),
    billing_address: utils_1.model
        .hasOne(() => address_1.default, {
        mappedBy: undefined,
        foreignKey: true,
    })
        .nullable(),
    items: utils_1.model.hasMany(() => line_item_1.default, {
        mappedBy: "cart",
    }),
    credit_lines: utils_1.model.hasMany(() => credit_line_1.default, {
        mappedBy: "cart",
    }),
    shipping_methods: utils_1.model.hasMany(() => shipping_method_1.default, {
        mappedBy: "cart",
    }),
})
    .cascades({
    delete: [
        "items",
        "shipping_methods",
        "shipping_address",
        "billing_address",
    ],
})
    .indexes([
    {
        name: "IDX_cart_region_id",
        on: ["region_id"],
        where: "deleted_at IS NULL AND region_id IS NOT NULL",
    },
    {
        name: "IDX_cart_customer_id",
        on: ["customer_id"],
        where: "deleted_at IS NULL AND customer_id IS NOT NULL",
    },
    {
        name: "IDX_cart_sales_channel_id",
        on: ["sales_channel_id"],
        where: "deleted_at IS NULL AND sales_channel_id IS NOT NULL",
    },
    {
        name: "IDX_cart_curency_code",
        on: ["currency_code"],
        where: "deleted_at IS NULL",
    },
    {
        name: "IDX_cart_shipping_address_id",
        on: ["shipping_address_id"],
        where: "deleted_at IS NULL AND shipping_address_id IS NOT NULL",
    },
    {
        name: "IDX_cart_billing_address_id",
        on: ["billing_address_id"],
        where: "deleted_at IS NULL AND billing_address_id IS NOT NULL",
    },
]);
exports.default = Cart;
//# sourceMappingURL=cart.js.map