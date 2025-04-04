"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRuleValueTransformQueryConfig = exports.listRuleTransformQueryConfig = exports.retrieveRuleTransformQueryConfig = exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminPromotionRuleFields = exports.defaultAdminPromotionFields = void 0;
exports.defaultAdminPromotionFields = [
    "id",
    "code",
    "is_automatic",
    "type",
    "status",
    "created_at",
    "updated_at",
    "deleted_at",
    "*campaign",
    "*campaign.budget",
    "*application_method",
    "*application_method.buy_rules",
    "application_method.buy_rules.values.value",
    "*application_method.target_rules",
    "application_method.target_rules.values.value",
    "rules.id",
    "rules.attribute",
    "rules.operator",
    "rules.values.value",
];
exports.defaultAdminPromotionRuleFields = [
    "id",
    "description",
    "attribute",
    "operator",
    "values.value",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminPromotionFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    isList: true,
};
exports.retrieveRuleTransformQueryConfig = {
    defaults: exports.defaultAdminPromotionRuleFields,
    isList: false,
};
exports.listRuleTransformQueryConfig = {
    ...exports.retrieveRuleTransformQueryConfig,
    isList: true,
};
exports.listRuleValueTransformQueryConfig = {
    defaults: [],
    allowed: [],
    isList: true,
};
//# sourceMappingURL=query-config.js.map