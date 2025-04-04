/**
 * In most casees, JSON.parse(JSON.stringify(obj)) is enough to deep copy an object.
 * But in some cases, it's not enough. For example, if the object contains a function or a proxy, it will be lost after JSON.parse(JSON.stringify(obj)).
 *
 * @param obj
 * @param cache
 */
export declare function deepCopy<T extends Record<any, any> | Record<any, any>[] = Record<any, any>, TOutput = T extends [] ? T[] : T>(obj: T, cache?: WeakMap<object, any>): TOutput;
//# sourceMappingURL=deep-copy.d.ts.map