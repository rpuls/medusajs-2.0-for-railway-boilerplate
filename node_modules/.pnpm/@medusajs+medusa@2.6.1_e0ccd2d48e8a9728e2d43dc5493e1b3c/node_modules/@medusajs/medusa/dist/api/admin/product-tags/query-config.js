"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProductTagsTransformQueryConfig = exports.retrieveProductTagTransformQueryConfig = exports.defaultAdminProductTagFields = void 0;
exports.defaultAdminProductTagFields = [
    "id",
    "value",
    "created_at",
    "updated_at",
];
exports.retrieveProductTagTransformQueryConfig = {
    defaults: exports.defaultAdminProductTagFields,
    isList: false,
};
exports.listProductTagsTransformQueryConfig = {
    ...exports.retrieveProductTagTransformQueryConfig,
    defaultLimit: 20,
    isList: true,
};
//# sourceMappingURL=query-config.js.map