"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProductVariantQueryConfig = exports.retrieveProductVariantQueryConfig = exports.defaultAdminProductVariantFields = void 0;
exports.defaultAdminProductVariantFields = [
    "id",
    "title",
    "sku",
    "barcode",
    "ean",
    "upc",
    "allow_backorder",
    "manage_inventory",
    "hs_code",
    "origin_country",
    "mid_code",
    "material",
    "weight",
    "length",
    "height",
    "width",
    "metadata",
    "variant_rank",
    "product_id",
    "created_at",
    "updated_at",
    "*product",
    "*prices",
    "*options",
    "prices.price_rules.value",
    "prices.price_rules.attribute",
];
exports.retrieveProductVariantQueryConfig = {
    defaults: exports.defaultAdminProductVariantFields,
    isList: false,
};
exports.listProductVariantQueryConfig = {
    ...exports.retrieveProductVariantQueryConfig,
    defaultLimit: 50,
    isList: true,
};
//# sourceMappingURL=query-config.js.map