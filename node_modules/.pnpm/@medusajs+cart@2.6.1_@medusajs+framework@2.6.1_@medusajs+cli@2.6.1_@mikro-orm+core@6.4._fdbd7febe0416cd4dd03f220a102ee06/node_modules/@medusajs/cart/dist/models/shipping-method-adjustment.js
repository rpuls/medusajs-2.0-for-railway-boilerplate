"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const shipping_method_1 = __importDefault(require("./shipping-method"));
const ShippingMethodAdjustment = utils_1.model
    .define({
    name: "ShippingMethodAdjustment",
    tableName: "cart_shipping_method_adjustment",
}, {
    id: utils_1.model.id({ prefix: "casmadj" }).primaryKey(),
    description: utils_1.model.text().nullable(),
    code: utils_1.model.text().nullable(),
    amount: utils_1.model.bigNumber(),
    provider_id: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    promotion_id: utils_1.model.text().nullable(),
    shipping_method: utils_1.model.belongsTo(() => shipping_method_1.default, {
        mappedBy: "adjustments",
    }),
})
    .indexes([
    {
        name: "IDX_shipping_method_adjustment_promotion_id",
        on: ["promotion_id"],
        where: "deleted_at IS NULL AND promotion_id IS NOT NULL",
    },
    {
        name: "IDX_adjustment_shipping_method_id",
        on: ["shipping_method_id"],
        where: "deleted_at IS NULL",
    },
]);
exports.default = ShippingMethodAdjustment;
//# sourceMappingURL=shipping-method-adjustment.js.map