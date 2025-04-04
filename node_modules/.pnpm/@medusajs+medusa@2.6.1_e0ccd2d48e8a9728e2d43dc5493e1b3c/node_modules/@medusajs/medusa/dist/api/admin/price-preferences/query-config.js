"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPricePreferenceQueryConfig = exports.retrivePricePreferenceQueryConfig = exports.adminPricePreferenceRemoteQueryFields = void 0;
exports.adminPricePreferenceRemoteQueryFields = [
    "id",
    "attribute",
    "value",
    "is_tax_inclusive",
    "created_at",
    "deleted_at",
    "updated_at",
];
exports.retrivePricePreferenceQueryConfig = {
    defaults: exports.adminPricePreferenceRemoteQueryFields,
    isList: false,
};
exports.listPricePreferenceQueryConfig = {
    ...exports.retrivePricePreferenceQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map