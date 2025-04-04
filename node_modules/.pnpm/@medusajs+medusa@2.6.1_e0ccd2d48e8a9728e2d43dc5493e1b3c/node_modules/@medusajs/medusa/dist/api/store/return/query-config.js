"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveTransformQueryConfig = exports.defaultReturnFields = void 0;
exports.defaultReturnFields = [
    "id",
    "order_id",
    "created_at",
    "updated_at",
    "deleted_at",
    "metadata",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultReturnFields,
    isList: false,
};
//# sourceMappingURL=query-config.js.map