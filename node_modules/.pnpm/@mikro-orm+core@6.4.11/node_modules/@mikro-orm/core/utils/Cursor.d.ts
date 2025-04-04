import { inspect } from 'node:util';
import type { EntityMetadata, FilterObject, Loaded } from '../typings';
import type { FindByCursorOptions, OrderDefinition } from '../drivers/IDatabaseDriver';
import { type QueryOrder } from '../enums';
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
export declare class Cursor<Entity extends object, Hint extends string = never, Fields extends string = '*', Excludes extends string = never> {
    readonly items: Loaded<Entity, Hint, Fields, Excludes>[];
    readonly totalCount: number;
    readonly hasPrevPage: boolean;
    readonly hasNextPage: boolean;
    private readonly definition;
    constructor(items: Loaded<Entity, Hint, Fields, Excludes>[], totalCount: number, options: FindByCursorOptions<Entity, Hint, Fields, Excludes>, meta: EntityMetadata<Entity>);
    get startCursor(): string | null;
    get endCursor(): string | null;
    /**
     * Computes the cursor value for a given entity.
     */
    from(entity: Entity | Loaded<Entity, Hint, Fields, Excludes>): string;
    [Symbol.iterator](): IterableIterator<Loaded<Entity, Hint, Fields, Excludes>>;
    get length(): number;
    /**
     * Computes the cursor value for given entity and order definition.
     */
    static for<Entity extends object>(meta: EntityMetadata<Entity>, entity: FilterObject<Entity>, orderBy: OrderDefinition<Entity>): string;
    static encode(value: unknown[]): string;
    static decode(value: string): unknown[];
    static getDefinition<Entity extends object>(meta: EntityMetadata<Entity>, orderBy: OrderDefinition<Entity>): [never, QueryOrder][];
    /** @ignore */
    [inspect.custom](): string;
}
