import type { AnyFunction, AnyObject, SetStateAction } from "./types.ts";
/**
 * Empty function.
 */
export declare function noop(..._: any[]): any;
/**
 * Compares two objects.
 * @example
 * shallowEqual({ a: "a" }, {}); // false
 * shallowEqual({ a: "a" }, { b: "b" }); // false
 * shallowEqual({ a: "a" }, { a: "a" }); // true
 * shallowEqual({ a: "a" }, { a: "a", b: "b" }); // false
 */
export declare function shallowEqual(a?: AnyObject, b?: AnyObject): boolean;
/**
 * Receives a `setState` argument and calls it with `currentValue` if it's a
 * function. Otherwise return the argument as the new value.
 * @example
 * applyState((value) => value + 1, 1); // 2
 * applyState(2, 1); // 2
 */
export declare function applyState<T>(argument: SetStateAction<T>, currentValue: T | (() => T)): T;
/**
 * Checks whether `arg` is an object or not.
 * @returns {boolean}
 */
export declare function isObject(arg: any): arg is Record<any, unknown>;
/**
 * Checks whether `arg` is empty or not.
 * @example
 * isEmpty([]); // true
 * isEmpty(["a"]); // false
 * isEmpty({}); // true
 * isEmpty({ a: "a" }); // false
 * isEmpty(); // true
 * isEmpty(null); // true
 * isEmpty(undefined); // true
 * isEmpty(""); // true
 */
export declare function isEmpty(arg: any): boolean;
/**
 * Checks whether `arg` is an integer or not.
 * @example
 * isInteger(1); // true
 * isInteger(1.5); // false
 * isInteger("1"); // true
 * isInteger("1.5"); // false
 */
export declare function isInteger(arg: any): boolean;
/**
 * Checks whether `prop` is an own property of `obj` or not.
 */
export declare function hasOwnProperty<T extends AnyObject>(object: T, prop: keyof any): prop is keyof T;
/**
 * Receives functions as arguments and returns a new function that calls all.
 */
export declare function chain<T>(...fns: T[]): (...args: T extends AnyFunction ? Parameters<T> : never) => void;
/**
 * Returns a string with the truthy values of `args` separated by space.
 */
export declare function cx(...args: Array<string | null | false | 0 | undefined>): string | undefined;
/**
 * Removes diatrics from a string.
 */
export declare function normalizeString(str: string): string;
/**
 * Omits specific keys from an object.
 * @example
 * omit({ a: "a", b: "b" }, ["a"]); // { b: "b" }
 */
export declare function omit<T extends AnyObject, K extends keyof T>(object: T, keys: ReadonlyArray<K> | K[]): Omit<T, K>;
/**
 * Picks specific keys from an object.
 * @example
 * pick({ a: "a", b: "b" }, ["a"]); // { a: "a" }
 */
export declare function pick<T extends AnyObject, K extends keyof T>(object: T, paths: ReadonlyArray<K> | K[]): Pick<T, K>;
/**
 * Returns the same argument.
 */
export declare function identity<T>(value: T): T;
/**
 * Runs right before the next paint.
 */
export declare function beforePaint(cb?: () => void): () => void;
/**
 * Runs after the next paint.
 */
export declare function afterPaint(cb?: () => void): () => void;
/**
 * Asserts that a condition is true, otherwise throws an error.
 * @example
 * invariant(
 *   condition,
 *   process.env.NODE_ENV !== "production" && "Invariant failed"
 * );
 */
export declare function invariant(condition: any, message?: string | boolean): asserts condition;
/**
 * Similar to `Object.keys` but returns a type-safe array of keys.
 */
export declare function getKeys<T extends object>(obj: T): Array<keyof T>;
/**
 * Checks whether a boolean event prop (e.g., hideOnInteractOutside) was
 * intentionally set to false, either with a boolean value or a callback that
 * returns false.
 */
export declare function isFalsyBooleanCallback<T extends unknown[]>(booleanOrCallback?: boolean | ((...args: T) => boolean), ...args: T): boolean;
/**
 * Checks whether something is disabled or not based on its props.
 */
export declare function disabledFromProps(props: {
    disabled?: boolean;
    "aria-disabled"?: boolean | "true" | "false";
}): boolean;
/**
 * Removes undefined values from an object.
 */
export declare function removeUndefinedValues<T extends AnyObject>(obj: T): T;
/**
 * Returns the first value that is not `undefined`.
 */
export declare function defaultValue<T extends readonly any[]>(...values: T): DefaultValue<T>;
type DefaultValue<T extends readonly any[], Other = never> = T extends [
    infer Head,
    ...infer Rest
] ? Rest extends [] ? T[number] | Other : undefined extends Head ? DefaultValue<Rest, Exclude<Other | Head, undefined>> : Exclude<T[number], undefined> : never;
export {};
