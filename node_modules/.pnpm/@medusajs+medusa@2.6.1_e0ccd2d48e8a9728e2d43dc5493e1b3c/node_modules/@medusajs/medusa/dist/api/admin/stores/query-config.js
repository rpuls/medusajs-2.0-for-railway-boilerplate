"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminStoreFields = void 0;
exports.defaultAdminStoreFields = [
    "id",
    "name",
    "*supported_currencies",
    "*supported_currencies.currency",
    "default_sales_channel_id",
    "default_region_id",
    "default_location_id",
    "metadata",
    "created_at",
    "updated_at",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminStoreFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map