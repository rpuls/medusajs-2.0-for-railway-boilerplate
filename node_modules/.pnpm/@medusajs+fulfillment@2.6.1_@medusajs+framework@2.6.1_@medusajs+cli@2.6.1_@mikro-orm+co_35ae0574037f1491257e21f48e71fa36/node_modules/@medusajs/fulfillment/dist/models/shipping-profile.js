"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingProfile = void 0;
const utils_1 = require("@medusajs/framework/utils");
const shipping_option_1 = require("./shipping-option");
exports.ShippingProfile = utils_1.model
    .define("shipping_profile", {
    id: utils_1.model.id({ prefix: "sp" }).primaryKey(),
    name: utils_1.model.text(),
    type: utils_1.model.text(),
    shipping_options: utils_1.model.hasMany(() => shipping_option_1.ShippingOption, {
        mappedBy: "shipping_profile",
    }),
    metadata: utils_1.model.json().nullable(),
})
    .indexes([
    {
        on: ["name"],
        unique: true,
        where: "deleted_at IS NULL",
    },
]);
//# sourceMappingURL=shipping-profile.js.map