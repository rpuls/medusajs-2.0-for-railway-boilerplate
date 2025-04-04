"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultStoreCurrencyFields = void 0;
exports.defaultStoreCurrencyFields = [
    "code",
    "name",
    "symbol",
    "symbol_native",
    "decimal_digits",
    "rounding",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultStoreCurrencyFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    defaultLimit: 50,
    isList: true,
};
//# sourceMappingURL=query-config.js.map