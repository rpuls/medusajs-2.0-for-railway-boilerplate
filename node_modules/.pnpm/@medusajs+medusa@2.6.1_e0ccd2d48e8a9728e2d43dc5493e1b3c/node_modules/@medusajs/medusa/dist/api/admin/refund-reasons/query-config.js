"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminRetrieveRefundReasonFields = exports.defaultAdminRefundReasonFields = void 0;
exports.defaultAdminRefundReasonFields = [
    "id",
    "label",
    "description",
    "created_at",
    "updated_at",
    "deleted_at",
];
exports.defaultAdminRetrieveRefundReasonFields = [
    ...exports.defaultAdminRefundReasonFields,
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminRetrieveRefundReasonFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    defaults: exports.defaultAdminRefundReasonFields,
    defaultLimit: 20,
    isList: true,
};
//# sourceMappingURL=query-config.js.map