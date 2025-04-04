"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminCollectionFields = void 0;
exports.defaultAdminCollectionFields = [
    "id",
    "title",
    "handle",
    "created_at",
    "updated_at",
    "metadata",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminCollectionFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    defaultLimit: 10,
    isList: true,
};
//# sourceMappingURL=query-config.js.map