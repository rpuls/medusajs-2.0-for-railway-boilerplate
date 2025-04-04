"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProductTypesTransformQueryConfig = exports.retrieveProductTypeTransformQueryConfig = exports.defaultAdminProductTypeFields = void 0;
exports.defaultAdminProductTypeFields = [
    "id",
    "value",
    "created_at",
    "updated_at",
    "metadata",
];
exports.retrieveProductTypeTransformQueryConfig = {
    defaults: exports.defaultAdminProductTypeFields,
    isList: false,
};
exports.listProductTypesTransformQueryConfig = {
    ...exports.retrieveProductTypeTransformQueryConfig,
    defaultLimit: 20,
    isList: true,
};
//# sourceMappingURL=query-config.js.map