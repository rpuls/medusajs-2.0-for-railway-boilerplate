"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProductQueryConfig = exports.retrieveProductQueryConfig = exports.defaultAdminProductFields = exports.listOptionConfig = exports.retrieveOptionConfig = exports.defaultAdminProductsOptionFields = exports.listVariantConfig = exports.retrieveVariantConfig = exports.defaultAdminProductsVariantFields = void 0;
exports.defaultAdminProductsVariantFields = [
    "id",
    "product_id",
    "title",
    "sku",
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
    "created_at",
    "updated_at",
    "deleted_at",
    "metadata",
    "variant_rank",
    "ean",
    "upc",
    "barcode",
    "*prices",
    "prices.price_rules.value",
    "prices.price_rules.attribute",
    "*options",
];
exports.retrieveVariantConfig = {
    defaults: exports.defaultAdminProductsVariantFields,
    isList: false,
};
exports.listVariantConfig = {
    ...exports.retrieveVariantConfig,
    defaultLimit: 50,
    isList: true,
};
exports.defaultAdminProductsOptionFields = ["id", "title"];
exports.retrieveOptionConfig = {
    defaults: exports.defaultAdminProductsOptionFields,
    isList: false,
};
exports.listOptionConfig = {
    ...exports.retrieveOptionConfig,
    defaultLimit: 50,
    isList: true,
};
exports.defaultAdminProductFields = [
    "id",
    "title",
    "subtitle",
    "status",
    "external_id",
    "description",
    "handle",
    "is_giftcard",
    "discountable",
    "thumbnail",
    "collection_id",
    "type_id",
    "weight",
    "length",
    "height",
    "width",
    "hs_code",
    "origin_country",
    "mid_code",
    "material",
    "created_at",
    "updated_at",
    "deleted_at",
    "metadata",
    "*type",
    "*collection",
    "*options",
    "*options.values",
    "*tags",
    "*images",
    "*variants",
    "*variants.prices",
    "variants.prices.price_rules.value",
    "variants.prices.price_rules.attribute",
    "*variants.options",
    "*sales_channels",
];
exports.retrieveProductQueryConfig = {
    defaults: exports.defaultAdminProductFields,
    isList: false,
};
exports.listProductQueryConfig = {
    ...exports.retrieveProductQueryConfig,
    defaultLimit: 50,
    isList: true,
};
//# sourceMappingURL=query-config.js.map