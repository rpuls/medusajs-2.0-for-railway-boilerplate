"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProductTypeConfig = exports.retrieveProductTypeConfig = exports.defaults = void 0;
exports.defaults = [
    "id",
    "value",
    "created_at",
    "updated_at",
    "metadata",
    "*products",
];
exports.retrieveProductTypeConfig = {
    defaults: exports.defaults,
    isList: false,
};
exports.listProductTypeConfig = {
    defaults: exports.defaults,
    defaultLimit: 50,
    isList: true,
};
//# sourceMappingURL=query-config.js.map