"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRuleTransformQueryConfig = exports.retrieveRuleTransformQueryConfig = exports.defaultAdminShippingOptionRuleFields = exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminShippingOptionFields = void 0;
exports.defaultAdminShippingOptionFields = [
    "id",
    "name",
    "price_type",
    "data",
    "provider_id",
    "metadata",
    "created_at",
    "updated_at",
    "*rules",
    "*type",
    "*prices",
    "*prices.price_rules",
    "*service_zone",
    "*shipping_profile",
    "*provider",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminShippingOptionFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    isList: true,
};
exports.defaultAdminShippingOptionRuleFields = [
    "id",
    "description",
    "attribute",
    "operator",
    "values.value",
];
exports.retrieveRuleTransformQueryConfig = {
    defaults: exports.defaultAdminShippingOptionRuleFields,
    isList: false,
};
exports.listRuleTransformQueryConfig = {
    ...exports.retrieveRuleTransformQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map