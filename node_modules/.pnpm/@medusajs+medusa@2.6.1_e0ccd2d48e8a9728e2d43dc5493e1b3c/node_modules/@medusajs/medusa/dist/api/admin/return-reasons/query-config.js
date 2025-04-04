"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminRetrieveReturnReasonFields = exports.defaultAdminReturnReasonFields = void 0;
exports.defaultAdminReturnReasonFields = [
    "id",
    "value",
    "label",
    "parent_return_reason_id",
    "description",
    "created_at",
    "updated_at",
    "deleted_at",
];
exports.defaultAdminRetrieveReturnReasonFields = [
    "id",
    "value",
    "label",
    "parent_return_reason_id",
    "description",
    "created_at",
    "updated_at",
    "deleted_at",
    "parent_return_reason.*",
    "return_reason_children.*",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminRetrieveReturnReasonFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    defaults: exports.defaultAdminReturnReasonFields,
    defaultLimit: 20,
    isList: true,
};
//# sourceMappingURL=query-config.js.map