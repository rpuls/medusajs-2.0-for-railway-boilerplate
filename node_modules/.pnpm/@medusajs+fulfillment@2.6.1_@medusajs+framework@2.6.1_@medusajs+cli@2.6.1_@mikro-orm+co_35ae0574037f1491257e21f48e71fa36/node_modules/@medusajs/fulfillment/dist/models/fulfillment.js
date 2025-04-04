"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fulfillment = void 0;
const utils_1 = require("@medusajs/framework/utils");
const address_1 = require("./address");
const fulfillment_item_1 = require("./fulfillment-item");
const fulfillment_label_1 = require("./fulfillment-label");
const fulfillment_provider_1 = require("./fulfillment-provider");
const shipping_option_1 = require("./shipping-option");
exports.Fulfillment = utils_1.model
    .define("fulfillment", {
    id: utils_1.model.id({ prefix: "ful" }).primaryKey(),
    location_id: utils_1.model.text(),
    packed_at: utils_1.model.dateTime().nullable(),
    shipped_at: utils_1.model.dateTime().nullable(),
    marked_shipped_by: utils_1.model.text().nullable(),
    created_by: utils_1.model.text().nullable(),
    delivered_at: utils_1.model.dateTime().nullable(),
    canceled_at: utils_1.model.dateTime().nullable(),
    data: utils_1.model.json().nullable(),
    requires_shipping: utils_1.model.boolean().default(true),
    items: utils_1.model.hasMany(() => fulfillment_item_1.FulfillmentItem, {
        mappedBy: "fulfillment",
    }),
    labels: utils_1.model.hasMany(() => fulfillment_label_1.FulfillmentLabel, {
        mappedBy: "fulfillment",
    }),
    provider: utils_1.model
        .hasOne(() => fulfillment_provider_1.FulfillmentProvider, {
        foreignKey: true,
        mappedBy: undefined,
    })
        .nullable(),
    shipping_option: utils_1.model
        .belongsTo(() => shipping_option_1.ShippingOption, {
        mappedBy: "fulfillments",
    })
        .nullable(),
    delivery_address: utils_1.model
        .hasOne(() => address_1.FulfillmentAddress, {
        foreignKey: true,
        mappedBy: undefined,
    })
        .nullable(),
    metadata: utils_1.model.json().nullable(),
})
    .indexes([
    {
        on: ["location_id"],
        where: "deleted_at IS NULL",
    },
])
    .cascades({
    delete: ["delivery_address", "items", "labels"],
});
//# sourceMappingURL=fulfillment.js.map