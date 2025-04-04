"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminStockLocationFields = void 0;
exports.defaultAdminStockLocationFields = [
    "id",
    "name",
    "metadata",
    "created_at",
    "updated_at",
    "address.id",
    "address.address_1",
    "address.address_2",
    "address.city",
    "address.country_code",
    "address.phone",
    "address.province",
    "address.postal_code",
    "address.metadata",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminStockLocationFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map