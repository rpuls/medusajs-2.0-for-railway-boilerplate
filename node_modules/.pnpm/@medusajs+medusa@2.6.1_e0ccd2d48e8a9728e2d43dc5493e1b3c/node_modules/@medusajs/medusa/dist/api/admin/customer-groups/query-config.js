"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminCustomerGroupFields = void 0;
exports.defaultAdminCustomerGroupFields = [
    "id",
    "name",
    "created_by",
    "created_at",
    "updated_at",
    "deleted_at",
    "metadata",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminCustomerGroupFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map