"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminFulfillmentsFields = void 0;
exports.defaultAdminFulfillmentsFields = [
    "id",
    "location_id",
    "packed_at",
    "shipped_at",
    "marked_shipped_by",
    "created_by",
    "delivered_at",
    "canceled_at",
    "data",
    "provider_id",
    "shipping_option_id",
    "metadata",
    "order",
    "created_at",
    "updated_at",
    "deleted_at",
    "*delivery_address",
    "*items",
    "*labels",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminFulfillmentsFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map