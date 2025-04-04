"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminCurrencyFields = void 0;
exports.defaultAdminCurrencyFields = [
    "code",
    "name",
    "symbol",
    "symbol_native",
    "decimal_digits",
    "rounding",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminCurrencyFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    defaultLimit: 200,
    isList: true,
};
//# sourceMappingURL=query-config.js.map