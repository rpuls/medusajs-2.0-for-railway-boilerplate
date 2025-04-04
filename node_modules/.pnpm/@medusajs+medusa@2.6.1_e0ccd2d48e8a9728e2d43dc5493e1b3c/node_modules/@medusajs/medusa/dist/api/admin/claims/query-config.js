"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminDetailsClaimFields = exports.defaultAdminClaimFields = void 0;
exports.defaultAdminClaimFields = [
    "id",
    "type",
    "order_id",
    "return_id",
    "display_id",
    "order_version",
    "refund_amount",
    "created_by",
    "created_at",
    "updated_at",
    "canceled_at",
];
exports.defaultAdminDetailsClaimFields = [
    ...exports.defaultAdminClaimFields,
    "additional_items.*",
    "claim_items.*",
    "claim_items.reason.*",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminDetailsClaimFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    defaults: exports.defaultAdminClaimFields,
    defaultLimit: 20,
    isList: true,
};
//# sourceMappingURL=query-config.js.map