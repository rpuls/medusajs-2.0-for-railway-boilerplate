"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminDetailsOrderEditFields = exports.defaultAdminOrderEditFields = void 0;
exports.defaultAdminOrderEditFields = [
    "id",
    "order_id",
    "display_id",
    "order_version",
    "created_at",
    "updated_at",
    "canceled_at",
];
exports.defaultAdminDetailsOrderEditFields = [
    ...exports.defaultAdminOrderEditFields,
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminDetailsOrderEditFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    defaults: exports.defaultAdminOrderEditFields,
    defaultLimit: 20,
    isList: true,
};
//# sourceMappingURL=query-config.js.map