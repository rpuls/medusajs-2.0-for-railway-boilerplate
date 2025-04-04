"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVariantPriceSet = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.ProductVariantPriceSet = {
    serviceName: utils_1.LINKS.ProductVariantPriceSet,
    isLink: true,
    databaseConfig: {
        tableName: "product_variant_price_set",
        idPrefix: "pvps",
    },
    alias: [
        {
            name: ["product_variant_price_set", "product_variant_price_sets"],
            entity: "LinkProductVariantPriceSet",
        },
    ],
    primaryKeys: ["id", "variant_id", "price_set_id"],
    relationships: [
        {
            serviceName: utils_1.Modules.PRODUCT,
            entity: "ProductVariant",
            primaryKey: "id",
            foreignKey: "variant_id",
            alias: "variant",
            args: {
                methodSuffix: "ProductVariants",
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
            serviceName: utils_1.Modules.PRODUCT,
            entity: "ProductVariant",
            fieldAlias: {
                price_set: "price_set_link.price_set",
                prices: {
                    path: "price_set_link.price_set.prices",
                    isList: true,
                    forwardArgumentsOnPath: ["price_set_link.price_set"],
                },
                calculated_price: {
                    path: "price_set_link.price_set.calculated_price",
                    forwardArgumentsOnPath: ["price_set_link.price_set"],
                },
            },
            relationship: {
                serviceName: utils_1.LINKS.ProductVariantPriceSet,
                primaryKey: "variant_id",
                foreignKey: "id",
                alias: "price_set_link",
            },
        },
        {
            serviceName: utils_1.Modules.PRICING,
            entity: "PriceSet",
            relationship: {
                serviceName: utils_1.LINKS.ProductVariantPriceSet,
                primaryKey: "price_set_id",
                foreignKey: "id",
                alias: "variant_link",
            },
            fieldAlias: {
                variant: "variant_link.variant",
            },
        },
    ],
};
//# sourceMappingURL=product-variant-price-set.js.map