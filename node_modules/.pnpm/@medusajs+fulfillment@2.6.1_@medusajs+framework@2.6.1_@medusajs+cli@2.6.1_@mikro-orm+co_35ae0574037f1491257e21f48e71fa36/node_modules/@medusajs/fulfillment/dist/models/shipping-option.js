"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingOption = void 0;
const utils_1 = require("@medusajs/framework/utils");
const fulfillment_1 = require("./fulfillment");
const fulfillment_provider_1 = require("./fulfillment-provider");
const service_zone_1 = require("./service-zone");
const shipping_option_rule_1 = require("./shipping-option-rule");
const shipping_option_type_1 = require("./shipping-option-type");
const shipping_profile_1 = require("./shipping-profile");
exports.ShippingOption = utils_1.model
    .define("shipping_option", {
    id: utils_1.model.id({ prefix: "so" }).primaryKey(),
    name: utils_1.model.text(),
    price_type: utils_1.model
        .enum(utils_1.ShippingOptionPriceType)
        .default(utils_1.ShippingOptionPriceType.FLAT),
    data: utils_1.model.json().nullable(),
    metadata: utils_1.model.json().nullable(),
    service_zone: utils_1.model.belongsTo(() => service_zone_1.ServiceZone, {
        mappedBy: "shipping_options",
    }),
    shipping_profile: utils_1.model
        .belongsTo(() => shipping_profile_1.ShippingProfile, {
        mappedBy: "shipping_options",
    })
        .nullable(),
    provider: utils_1.model.belongsTo(() => fulfillment_provider_1.FulfillmentProvider).nullable(),
    type: utils_1.model.hasOne(() => shipping_option_type_1.ShippingOptionType, {
        foreignKey: true,
        foreignKeyName: "shipping_option_type_id",
        mappedBy: undefined,
    }),
    rules: utils_1.model.hasMany(() => shipping_option_rule_1.ShippingOptionRule, {
        mappedBy: "shipping_option",
    }),
    fulfillments: utils_1.model.hasMany(() => fulfillment_1.Fulfillment, {
        mappedBy: "shipping_option",
    }),
})
    .cascades({
    delete: ["rules", "type"],
});
//# sourceMappingURL=shipping-option.js.map