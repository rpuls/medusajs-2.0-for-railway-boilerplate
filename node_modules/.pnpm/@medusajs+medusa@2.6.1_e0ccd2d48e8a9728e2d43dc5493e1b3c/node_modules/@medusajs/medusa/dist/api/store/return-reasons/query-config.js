"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultStoreRetrieveReturnReasonFields = void 0;
exports.defaultStoreRetrieveReturnReasonFields = [
    "id",
    "value",
    "label",
    "parent_return_reason_id",
    "description",
    "created_at",
    "updated_at",
    "deleted_at",
    "*parent_return_reason",
    "*return_reason_children",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultStoreRetrieveReturnReasonFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    defaults: exports.defaultStoreRetrieveReturnReasonFields,
    defaultLimit: 20,
    isList: true,
};
//# sourceMappingURL=query-config.js.map