"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminApiKeyFields = void 0;
exports.defaultAdminApiKeyFields = [
    "id",
    "title",
    "token",
    "redacted",
    "type",
    "last_used_at",
    "updated_at",
    "created_at",
    "created_by",
    "revoked_at",
    "revoked_by",
    "sales_channels.id",
    "sales_channels.name",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminApiKeyFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    defaultLimit: 20,
    isList: true,
};
//# sourceMappingURL=query-config.js.map