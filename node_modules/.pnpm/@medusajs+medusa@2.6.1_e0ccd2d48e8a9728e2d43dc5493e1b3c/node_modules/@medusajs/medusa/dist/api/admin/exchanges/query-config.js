"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminDetailsExchangeFields = exports.defaultAdminExchangeFields = void 0;
exports.defaultAdminExchangeFields = [
    "id",
    "order_id",
    "return_id",
    "display_id",
    "order_version",
    "created_by",
    "created_at",
    "updated_at",
    "canceled_at",
];
exports.defaultAdminDetailsExchangeFields = [
    ...exports.defaultAdminExchangeFields,
    "additional_items.*",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminDetailsExchangeFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    defaults: exports.defaultAdminExchangeFields,
    defaultLimit: 20,
    isList: true,
};
//# sourceMappingURL=query-config.js.map