"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.listLocationLevelsTransformQueryConfig = exports.retrieveLocationLevelsTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminInventoryItemFields = exports.defaultAdminLocationLevelFields = void 0;
// eslint-disable-next-line max-len
exports.defaultAdminLocationLevelFields = [
    "id",
    "inventory_item_id",
    "location_id",
    "stocked_quantity",
    "reserved_quantity",
    "incoming_quantity",
    "available_quantity",
    "metadata",
    "created_at",
    "updated_at",
];
exports.defaultAdminInventoryItemFields = [
    "id",
    "sku",
    "title",
    "description",
    "thumbnail",
    "origin_country",
    "hs_code",
    "requires_shipping",
    "mid_code",
    "material",
    "weight",
    "length",
    "height",
    "width",
    "metadata",
    "reserved_quantity",
    "stocked_quantity",
    "created_at",
    "updated_at",
    "*location_levels",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminInventoryItemFields,
    isList: false,
};
exports.retrieveLocationLevelsTransformQueryConfig = {
    defaults: exports.defaultAdminLocationLevelFields,
    isList: false,
};
exports.listLocationLevelsTransformQueryConfig = {
    ...exports.retrieveLocationLevelsTransformQueryConfig,
    isList: true,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map