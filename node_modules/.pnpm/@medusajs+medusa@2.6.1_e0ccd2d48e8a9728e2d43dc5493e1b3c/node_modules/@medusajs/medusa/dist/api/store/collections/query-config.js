"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultStoreCollectionFields = void 0;
exports.defaultStoreCollectionFields = [
    "id",
    "title",
    "handle",
    "created_at",
    "updated_at",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultStoreCollectionFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    defaultLimit: 10,
    isList: true,
};
//# sourceMappingURL=query-config.js.map