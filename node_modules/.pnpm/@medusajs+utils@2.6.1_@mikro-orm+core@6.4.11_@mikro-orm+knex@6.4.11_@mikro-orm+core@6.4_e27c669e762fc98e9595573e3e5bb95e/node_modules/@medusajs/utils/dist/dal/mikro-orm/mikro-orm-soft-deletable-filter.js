"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mikroOrmSoftDeletableFilterOptions = exports.SoftDeletableFilterKey = void 0;
exports.SoftDeletableFilterKey = "softDeletable";
exports.mikroOrmSoftDeletableFilterOptions = {
    name: exports.SoftDeletableFilterKey,
    cond: ({ withDeleted } = {}) => {
        if (withDeleted) {
            return {};
        }
        return {
            deleted_at: null,
        };
    },
    default: true,
    args: false,
};
//# sourceMappingURL=mikro-orm-soft-deletable-filter.js.map