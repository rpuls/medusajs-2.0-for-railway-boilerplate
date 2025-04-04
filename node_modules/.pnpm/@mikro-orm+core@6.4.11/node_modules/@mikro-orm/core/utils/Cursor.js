"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cursor = void 0;
const node_util_1 = require("node:util");
const Utils_1 = require("./Utils");
const enums_1 = require("../enums");
const Reference_1 = require("../entity/Reference");
const wrap_1 = require("../entity/wrap");
const RawQueryFragment_1 = require("../utils/RawQueryFragment");
const errors_1 = require("../errors");
/**
 * As an alternative to the offset-based pagination with `limit` and `offset`, we can paginate based on a cursor.
 * A cursor is an opaque string that defines a specific place in ordered entity graph. You can use `em.findByCursor()`
 * to access those options. Under the hood, it will call `em.find()` and `em.count()` just like the `em.findAndCount()`
 * method, but will use the cursor options instead.
 *
 * Supports `before`, `after`, `first` and `last` options while disallowing `limit` and `offset`. Explicit `orderBy` option is required.
 *
 * Use `first` and `after` for forward pagination, or `last` and `before` for backward pagination.
 *
 * - `first` and `last` are numbers and serve as an alternative to `offset`, those options are mutually exclusive, use only one at a time
 * - `before` and `after` specify the previous cursor value
 *
 * ```ts
 * const currentCursor = await em.findByCursor(User, {}, {
 *   first: 10,
 *   after: previousCursor, // can be either string or `Cursor` instance
 *   orderBy: { id: 'desc' },
 * });
 *
 * // to fetch next page
 * const nextCursor = await em.findByCursor(User, {}, {
 *   first: 10,
 *   after: currentCursor.endCursor, // or currentCursor.endCursor
 *   orderBy: { id: 'desc' },
 * });
 * ```
 *
 * The `Cursor` object provides the following interface:
 *
 * ```ts
 * Cursor<User> {
 *   items: [
 *     User { ... },
 *     User { ... },
 *     User { ... },
 *     ...
 *   ],
 *   totalCount: 50,
 *   length: 10,
 *   startCursor: 'WzRd',
 *   endCursor: 'WzZd',
 *   hasPrevPage: true,
 *   hasNextPage: true,
 * }
 * ```
 */
class Cursor {
    items;
    totalCount;
    hasPrevPage;
    hasNextPage;
    definition;
    constructor(items, totalCount, options, meta) {
        this.items = items;
        this.totalCount = totalCount;
        const { first, last, before, after, orderBy, overfetch } = options;
        const limit = first ?? last;
        const isLast = !first && !!last;
        const hasMorePages = !!overfetch && limit != null && items.length > limit;
        this.hasPrevPage = isLast ? hasMorePages : !!after;
        this.hasNextPage = isLast ? !!before : hasMorePages;
        if (hasMorePages) {
            if (isLast) {
                items.shift();
            }
            else {
                items.pop();
            }
        }
        this.definition = Cursor.getDefinition(meta, orderBy);
    }
    get startCursor() {
        if (this.items.length === 0) {
            return null;
        }
        return this.from(this.items[0]);
    }
    get endCursor() {
        if (this.items.length === 0) {
            return null;
        }
        return this.from(this.items[this.items.length - 1]);
    }
    /**
     * Computes the cursor value for a given entity.
     */
    from(entity) {
        const processEntity = (entity, prop, direction, object = false) => {
            if (Utils_1.Utils.isPlainObject(direction)) {
                return Utils_1.Utils.keys(direction).reduce((o, key) => {
                    Object.assign(o, processEntity(Reference_1.Reference.unwrapReference(entity[prop]), key, direction[key], true));
                    return o;
                }, {});
            }
            if (entity[prop] == null) {
                throw errors_1.CursorError.entityNotPopulated(entity, prop);
            }
            let value = entity[prop];
            if (Utils_1.Utils.isEntity(value, true)) {
                value = (0, wrap_1.helper)(value).getPrimaryKey();
            }
            if (object) {
                return ({ [prop]: value });
            }
            return value;
        };
        const value = this.definition.map(([key, direction]) => processEntity(entity, key, direction));
        return Cursor.encode(value);
    }
    *[Symbol.iterator]() {
        for (const item of this.items) {
            yield item;
        }
    }
    get length() {
        return this.items.length;
    }
    /**
     * Computes the cursor value for given entity and order definition.
     */
    static for(meta, entity, orderBy) {
        const definition = this.getDefinition(meta, orderBy);
        return Cursor.encode(definition.map(([key]) => entity[key]));
    }
    static encode(value) {
        return Buffer.from(JSON.stringify(value)).toString('base64url');
    }
    static decode(value) {
        return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')).map((value) => {
            if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}/)) {
                return new Date(value);
            }
            return value;
        });
    }
    static getDefinition(meta, orderBy) {
        return Utils_1.Utils.asArray(orderBy).flatMap(order => {
            const ret = [];
            for (const key of Utils_1.Utils.keys(order)) {
                if (RawQueryFragment_1.RawQueryFragment.isKnownFragment(key)) {
                    ret.push([key, order[key]]);
                    continue;
                }
                const prop = meta.properties[key];
                if (!prop || !([enums_1.ReferenceKind.SCALAR, enums_1.ReferenceKind.EMBEDDED, enums_1.ReferenceKind.MANY_TO_ONE].includes(prop.kind) || (prop.kind === enums_1.ReferenceKind.ONE_TO_ONE && prop.owner))) {
                    continue;
                }
                ret.push([prop.name, order[prop.name]]);
            }
            return ret;
        });
    }
    /* istanbul ignore next */
    /** @ignore */
    [node_util_1.inspect.custom]() {
        const type = this.items[0]?.constructor.name;
        const { items, startCursor, endCursor, hasPrevPage, hasNextPage, totalCount, length } = this;
        const options = (0, node_util_1.inspect)({ startCursor, endCursor, totalCount, hasPrevPage, hasNextPage, items, length }, { depth: 0 });
        return `Cursor${type ? `<${type}>` : ''} ${options.replace('items: [Array]', 'items: [...]')}`;
    }
}
exports.Cursor = Cursor;
