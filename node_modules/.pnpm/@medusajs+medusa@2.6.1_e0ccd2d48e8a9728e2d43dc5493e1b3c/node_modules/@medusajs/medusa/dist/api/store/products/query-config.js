"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProductQueryConfig = exports.retrieveProductQueryConfig = exports.defaultStoreProductFields = void 0;
exports.defaultStoreProductFields = [
    "id",
    "title",
    "subtitle",
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
    "*type",
    "*collection",
    "*options",
    "*options.values",
    "*tags",
    "*images",
    "*variants",
    "*variants.options",
];
exports.retrieveProductQueryConfig = {
    defaults: exports.defaultStoreProductFields,
    isList: false,
};
exports.listProductQueryConfig = {
    ...exports.retrieveProductQueryConfig,
    defaultLimit: 50,
    isList: true,
};
//# sourceMappingURL=query-config.js.map