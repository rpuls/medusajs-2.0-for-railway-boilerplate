"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminNotificationFields = void 0;
exports.defaultAdminNotificationFields = [
    "id",
    "to",
    "channel",
    "template",
    "data",
    "trigger_type",
    "resource_id",
    "resource_type",
    "receiver_id",
    "created_at",
    "updated_at",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminNotificationFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map