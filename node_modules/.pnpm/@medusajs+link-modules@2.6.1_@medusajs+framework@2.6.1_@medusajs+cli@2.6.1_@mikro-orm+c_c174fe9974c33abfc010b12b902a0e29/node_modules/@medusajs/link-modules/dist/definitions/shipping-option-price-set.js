"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingOptionPriceSet = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.ShippingOptionPriceSet = {
    serviceName: utils_1.LINKS.ShippingOptionPriceSet,
    isLink: true,
    databaseConfig: {
        tableName: "shipping_option_price_set",
        idPrefix: "sops",
    },
    alias: [
        {
            name: ["shipping_option_price_set", "shipping_option_price_sets"],
            entity: "LinkShippingOptionPriceSet",
        },
    ],
    primaryKeys: ["id", "shipping_option_id", "price_set_id"],
    relationships: [
        {
            serviceName: utils_1.Modules.FULFILLMENT,
            entity: "ShippingOption",
            primaryKey: "id",
            foreignKey: "shipping_option_id",
            alias: "shipping_option",
            args: {
                methodSuffix: "ShippingOptions",
            },
        },
        {
            serviceName: utils_1.Modules.PRICING,
            entity: "PriceSet",
            primaryKey: "id",
            foreignKey: "price_set_id",
            alias: "price_set",
            args: {
                methodSuffix: "PriceSets",
            },
            deleteCascade: true,
        },
    ],
    extends: [
        {
            serviceName: utils_1.Modules.FULFILLMENT,
            entity: "ShippingOption",
            fieldAlias: {
                prices: {
                    path: "price_set_link.price_set.prices",
                    isList: true,
                },
                calculated_price: {
                    path: "price_set_link.price_set.calculated_price",
                    forwardArgumentsOnPath: ["price_set_link.price_set"],
                },
            },
            relationship: {
                serviceName: utils_1.LINKS.ShippingOptionPriceSet,
                primaryKey: "shipping_option_id",
                foreignKey: "id",
                alias: "price_set_link",
            },
        },
        {
            serviceName: utils_1.Modules.PRICING,
            entity: "PriceSet",
            relationship: {
                serviceName: utils_1.LINKS.ShippingOptionPriceSet,
                primaryKey: "price_set_id",
                foreignKey: "id",
                alias: "shipping_option_link",
            },
            fieldAlias: {
                shipping_option: "shipping_option_link.shipping_option",
            },
        },
    ],
};
//# sourceMappingURL=shipping-option-price-set.js.map