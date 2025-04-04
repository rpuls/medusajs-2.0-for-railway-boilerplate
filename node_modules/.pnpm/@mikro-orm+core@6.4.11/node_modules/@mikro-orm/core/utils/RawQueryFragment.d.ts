import { inspect } from 'node:util';
import type { AnyString, Dictionary, EntityKey } from '../typings';
export declare class RawQueryFragment {
    #private;
    readonly sql: string;
    readonly params: unknown[];
    static cloneRegistry?: Set<string>;
    constructor(sql: string, params?: unknown[]);
    as(alias: string): RawQueryFragment;
    valueOf(): string;
    toJSON(): string;
    toString(): string;
    /** @internal */
    assign(): void;
    clone(): RawQueryFragment;
    static run<T>(cb: (...args: any[]) => Promise<T>): Promise<T>;
    /**
     * @internal allows testing we don't leak memory, as the raw fragments cache needs to be cleared automatically
     */
    static checkCacheSize(): number;
    static isKnownFragment(key: string | RawQueryFragment): boolean;
    static getKnownFragment(key: string | RawQueryFragment, cleanup?: boolean): RawQueryFragment | undefined;
    static remove(key: string): void;
    /** @ignore */
    [inspect.custom](): {
        sql: string;
        params: unknown[];
    } | {
        sql: string;
        params?: undefined;
    };
}
/** @internal */
export declare const ALIAS_REPLACEMENT = "[::alias::]";
/** @internal */
export declare const ALIAS_REPLACEMENT_RE = "\\[::alias::\\]";
/**
 * Creates raw SQL query fragment that can be assigned to a property or part of a filter. This fragment is represented
 * by `RawQueryFragment` class instance that can be serialized to a string, so it can be used both as an object value
 * and key. When serialized, the fragment key gets cached and only such cached key will be recognized by the ORM.
 * This adds a runtime safety to the raw query fragments.
 *
 * > **`raw()` helper is required since v6 to use a raw fragment in your query, both through EntityManager and QueryBuilder.**
 *
 * ```ts
 * // as a value
 * await em.find(User, { time: raw('now()') });
 *
 * // as a key
 * await em.find(User, { [raw('lower(name)')]: name.toLowerCase() });
 *
 * // value can be empty array
 * await em.find(User, { [raw('(select 1 = 1)')]: [] });
 * ```
 *
 * The `raw` helper supports several signatures, you can pass in a callback that receives the current property alias:
 *
 * ```ts
 * await em.find(User, { [raw(alias => `lower(${alias}.name)`)]: name.toLowerCase() });
 * ```
 *
 * You can also use the `sql` tagged template function, which works the same, but supports only the simple string signature:
 *
 * ```ts
 * await em.find(User, { [sql`lower(name)`]: name.toLowerCase() });
 * ```
 *
 * When using inside filters, you might have to use a callback signature to create new raw instance for every filter usage.
 *
 * ```ts
 * @Filter({ name: 'long', cond: () => ({ [raw('length(perex)')]: { $gt: 10000 } }) })
 * ```
 */
export declare function raw<T extends object = any, R = any>(sql: EntityKey<T> | EntityKey<T>[] | AnyString | ((alias: string) => string) | RawQueryFragment, params?: readonly unknown[] | Dictionary<unknown>): R;
/**
 * Alternative to the `raw()` helper allowing to use it as a tagged template function for the simple cases.
 *
 * ```ts
 * // as a value
 * await em.find(User, { time: sql`now()` });
 *
 * // as a key
 * await em.find(User, { [sql`lower(name)`]: name.toLowerCase() });
 *
 * // value can be empty array
 * await em.find(User, { [sql`(select 1 = 1)`]: [] });
 * ```
 */
export declare function sql(sql: readonly string[], ...values: unknown[]): any;
export declare namespace sql {
    var ref: <T extends object>(...keys: string[]) => RawQueryFragment;
    var now: (length?: number) => string;
    var lower: <T extends object>(key: string | ((alias: string) => string)) => string;
    var upper: <T extends object>(key: string | ((alias: string) => string)) => string;
}
export declare function createSqlFunction<T extends object, R = string>(func: string, key: string | ((alias: string) => string)): R;
