"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProductTagConfig = exports.retrieveProductTagConfig = exports.defaults = void 0;
exports.defaults = [
    "id",
    "value",
    "created_at",
    "updated_at",
    "metadata",
    "*products",
];
exports.retrieveProductTagConfig = {
    defaults: exports.defaults,
    isList: false,
};
exports.listProductTagConfig = {
    defaults: exports.defaults,
    defaultLimit: 50,
    isList: true,
};
//# sourceMappingURL=query-config.js.map