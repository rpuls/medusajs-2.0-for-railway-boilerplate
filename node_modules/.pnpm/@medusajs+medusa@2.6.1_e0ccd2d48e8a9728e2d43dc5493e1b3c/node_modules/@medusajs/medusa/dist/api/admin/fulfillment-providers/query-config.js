"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminFulfillmentProvidersFields = void 0;
exports.defaultAdminFulfillmentProvidersFields = ["id", "is_enabled"];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminFulfillmentProvidersFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map