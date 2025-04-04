"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceZone = void 0;
const utils_1 = require("@medusajs/framework/utils");
const fulfillment_set_1 = require("./fulfillment-set");
const geo_zone_1 = require("./geo-zone");
const shipping_option_1 = require("./shipping-option");
exports.ServiceZone = utils_1.model
    .define("service_zone", {
    id: utils_1.model.id({ prefix: "serzo" }).primaryKey(),
    name: utils_1.model.text(),
    fulfillment_set: utils_1.model.belongsTo(() => fulfillment_set_1.FulfillmentSet, {
        mappedBy: "service_zones",
    }),
    geo_zones: utils_1.model.hasMany(() => geo_zone_1.GeoZone, {
        mappedBy: "service_zone",
    }),
    shipping_options: utils_1.model.hasMany(() => shipping_option_1.ShippingOption, {
        mappedBy: "service_zone",
    }),
    metadata: utils_1.model.json().nullable(),
})
    .indexes([
    {
        on: ["name"],
        unique: true,
        where: "deleted_at IS NULL",
    },
])
    .cascades({
    delete: ["geo_zones", "shipping_options"],
});
//# sourceMappingURL=service-zone.js.map