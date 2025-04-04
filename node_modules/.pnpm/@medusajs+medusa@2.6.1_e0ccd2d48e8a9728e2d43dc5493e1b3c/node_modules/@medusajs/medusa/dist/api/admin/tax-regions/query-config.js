"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaults = void 0;
exports.defaults = [
    "id",
    "country_code",
    "province_code",
    "parent_id",
    "provider_id",
    "created_by",
    "created_at",
    "updated_at",
    "deleted_at",
    "metadata",
    "*children",
    "*children.tax_rates",
    "*children.tax_rates.rules",
    "*parent",
    "*tax_rates",
    "*tax_rates.rules",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaults,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map