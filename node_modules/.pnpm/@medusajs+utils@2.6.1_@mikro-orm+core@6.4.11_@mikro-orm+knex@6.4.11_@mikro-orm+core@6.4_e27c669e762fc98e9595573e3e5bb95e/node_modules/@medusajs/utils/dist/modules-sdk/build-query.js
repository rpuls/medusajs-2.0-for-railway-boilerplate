"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildQuery = buildQuery;
const common_1 = require("../common");
const mikro_orm_soft_deletable_filter_1 = require("../dal/mikro-orm/mikro-orm-soft-deletable-filter");
// Following convention here is fine, we can make it configurable if needed.
const DELETED_AT_FIELD_NAME = "deleted_at";
function buildQuery(filters = {}, config = {}) {
    const where = {};
    const filterFlags = {};
    buildWhere(filters, where, filterFlags);
    delete config.primaryKeyFields;
    const findOptions = {
        populate: (0, common_1.deduplicate)(config.relations ?? []),
        fields: config.select,
        limit: Number.isSafeInteger(config.take) && config.take != null
            ? config.take
            : undefined,
        offset: Number.isSafeInteger(config.skip) && config.skip != null
            ? config.skip
            : undefined,
    };
    if (config.order) {
        findOptions.orderBy = config.order;
    }
    if (config.withDeleted || filterFlags.withDeleted) {
        findOptions.filters ??= {};
        findOptions.filters[mikro_orm_soft_deletable_filter_1.SoftDeletableFilterKey] = {
            withDeleted: true,
        };
    }
    if (config.filters) {
        findOptions.filters ??= {};
        for (const [key, value] of Object.entries(config.filters)) {
            findOptions.filters[key] = value;
        }
    }
    if (config.options) {
        Object.assign(findOptions, config.options);
    }
    return { where, options: findOptions };
}
function buildWhere(filters = {}, where = {}, flags = {}) {
    for (let [prop, value] of Object.entries(filters)) {
        if (prop === DELETED_AT_FIELD_NAME) {
            flags.withDeleted = true;
        }
        if (["$or", "$and"].includes(prop)) {
            if (!Array.isArray(value)) {
                throw new Error(`Expected array for ${prop} but got ${value}`);
            }
            where[prop] = value.map((val) => {
                const deepWhere = {};
                buildWhere(val, deepWhere, flags);
                return deepWhere;
            });
            continue;
        }
        if (Array.isArray(value)) {
            where[prop] = (0, common_1.deduplicate)(value);
            continue;
        }
        if ((0, common_1.isObject)(value)) {
            where[prop] = {};
            buildWhere(value, where[prop], flags);
            continue;
        }
        where[prop] = value;
    }
}
//# sourceMappingURL=build-query.js.map