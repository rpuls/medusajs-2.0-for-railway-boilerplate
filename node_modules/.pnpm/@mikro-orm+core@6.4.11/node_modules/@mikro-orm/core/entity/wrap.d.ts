import type { IWrappedEntity, IWrappedEntityInternal } from '../typings';
/**
 * returns WrappedEntity instance associated with this entity. This includes all the internal properties like `__meta` or `__em`.
 */
export declare function wrap<T extends object>(entity: T, preferHelper: true): IWrappedEntityInternal<T>;
/**
 * wraps entity type with WrappedEntity internal properties and helpers like init/isInitialized/populated/toJSON
 */
export declare function wrap<T extends object>(entity: T, preferHelper?: false): IWrappedEntity<T>;
/**
 * wraps entity type with WrappedEntity internal properties and helpers like init/isInitialized/populated/toJSON
 * use `preferHelper = true` to have access to the internal `__` properties like `__meta` or `__em`
 * @internal
 */
export declare function helper<T extends object>(entity: T): IWrappedEntityInternal<T>;
