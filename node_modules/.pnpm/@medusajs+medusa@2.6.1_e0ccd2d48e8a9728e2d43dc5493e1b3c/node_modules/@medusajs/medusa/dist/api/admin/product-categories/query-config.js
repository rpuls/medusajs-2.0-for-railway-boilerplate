"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProductCategoryConfig = exports.retrieveProductCategoryConfig = exports.allowed = exports.defaults = void 0;
exports.defaults = [
    "id",
    "name",
    "description",
    "handle",
    "is_active",
    "is_internal",
    "rank",
    "parent_category_id",
    "created_at",
    "updated_at",
    "metadata",
    "*parent_category",
    "*category_children",
];
exports.allowed = [
    "id",
    "name",
    "description",
    "handle",
    "is_active",
    "is_internal",
    "rank",
    "parent_category_id",
    "created_at",
    "updated_at",
    "metadata",
    "category_children",
    "parent_category",
    "products",
];
exports.retrieveProductCategoryConfig = {
    defaults: exports.defaults,
    allowed: exports.allowed,
    isList: false,
};
exports.listProductCategoryConfig = {
    defaults: exports.defaults,
    allowed: exports.allowed,
    defaultLimit: 50,
    isList: true,
};
//# sourceMappingURL=query-config.js.map