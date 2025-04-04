import { EntityManager } from '../EntityManager';
import { MikroORM } from '../MikroORM';
import type { ContextProvider, MaybePromise } from '../typings';
/**
 * Find `EntityManager` in provided context, or else in instance's `orm` or `em` properties.
 */
export declare function resolveContextProvider<T>(caller: T & {
    orm?: MaybePromise<MikroORM>;
    em?: MaybePromise<EntityManager>;
}, provider?: ContextProvider<T>): Promise<EntityManager | undefined>;
