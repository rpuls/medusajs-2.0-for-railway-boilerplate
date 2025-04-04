"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminCampaignFields = void 0;
exports.defaultAdminCampaignFields = [
    "id",
    "name",
    "description",
    "currency",
    "campaign_identifier",
    "*budget",
    "starts_at",
    "ends_at",
    "created_at",
    "updated_at",
    "deleted_at",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminCampaignFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map