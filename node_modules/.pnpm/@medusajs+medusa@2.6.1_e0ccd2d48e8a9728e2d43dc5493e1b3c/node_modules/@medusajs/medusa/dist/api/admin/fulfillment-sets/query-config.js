"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveServiceZoneTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminFulfillmentSetsFields = void 0;
exports.defaultAdminFulfillmentSetsFields = [
    "id",
    "name",
    "type",
    "created_at",
    "updated_at",
    "deleted_at",
    "*service_zones",
    "*service_zones.geo_zones",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminFulfillmentSetsFields,
    isList: false,
};
exports.retrieveServiceZoneTransformQueryConfig = {
    defaults: [
        "id",
        "name",
        "type",
        "created_at",
        "updated_at",
        "deleted_at",
        "*geo_zones",
    ],
    isList: false,
};
//# sourceMappingURL=query-config.js.map