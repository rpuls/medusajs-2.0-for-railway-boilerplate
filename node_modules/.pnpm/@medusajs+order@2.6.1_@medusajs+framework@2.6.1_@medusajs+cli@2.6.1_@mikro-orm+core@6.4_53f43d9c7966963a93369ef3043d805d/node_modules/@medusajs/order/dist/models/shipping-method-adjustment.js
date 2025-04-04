"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderShippingMethodAdjustment = void 0;
const utils_1 = require("@medusajs/framework/utils");
const shipping_method_1 = require("./shipping-method");
const _OrderShippingMethodAdjustment = utils_1.model
    .define({
    tableName: "order_shipping_method_adjustment",
    name: "OrderShippingMethodAdjustment",
}, {
    id: utils_1.model.id({ prefix: "ordsmadj" }).primaryKey(),
    description: utils_1.model.text().nullable(),
    promotion_id: utils_1.model.text().nullable(),
    code: utils_1.model.text().nullable(),
    amount: utils_1.model.bigNumber(),
    provider_id: utils_1.model.text().nullable(),
    shipping_method: utils_1.model.belongsTo(() => shipping_method_1.OrderShippingMethod, {
        mappedBy: "adjustments",
    }),
})
    .indexes([
    {
        name: "IDX_order_shipping_method_adjustment_shipping_method_id",
        on: ["shipping_method_id"],
        unique: false,
    },
]);
exports.OrderShippingMethodAdjustment = _OrderShippingMethodAdjustment;
//# sourceMappingURL=shipping-method-adjustment.js.map