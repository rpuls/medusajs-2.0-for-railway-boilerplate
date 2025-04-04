"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminSalesChannelFields = void 0;
exports.defaultAdminSalesChannelFields = [
    "id",
    "name",
    "description",
    "is_disabled",
    "created_at",
    "updated_at",
    "deleted_at",
    "metadata",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminSalesChannelFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map