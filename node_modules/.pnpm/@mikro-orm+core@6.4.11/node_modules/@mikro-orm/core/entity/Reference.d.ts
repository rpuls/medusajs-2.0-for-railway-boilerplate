import { inspect } from 'node:util';
import type { AddEager, Dictionary, EntityClass, EntityKey, EntityProperty, Loaded, LoadedReference, Primary, Ref } from '../typings';
import type { FindOneOptions, FindOneOrFailOptions } from '../drivers/IDatabaseDriver';
export declare class Reference<T extends object> {
    private entity;
    constructor(entity: T);
    static create<T extends object>(entity: T | Ref<T>): Ref<T>;
    static createFromPK<T extends object>(entityType: EntityClass<T>, pk: Primary<T>, options?: {
        schema?: string;
    }): Ref<T>;
    static createNakedFromPK<T extends object>(entityType: EntityClass<T>, pk: Primary<T>, options?: {
        schema?: string;
    }): T;
    /**
     * Checks whether the argument is instance of `Reference` wrapper.
     */
    static isReference<T extends object>(data: any): data is Reference<T>;
    /**
     * Wraps the entity in a `Reference` wrapper if the property is defined as `ref`.
     */
    static wrapReference<T extends object, O extends object>(entity: T | Reference<T>, prop: EntityProperty<O, T>): Reference<T> | T;
    /**
     * Returns wrapped entity.
     */
    static unwrapReference<T extends object>(ref: T | Reference<T> | ScalarReference<T> | Ref<T>): T;
    /**
     * Ensures the underlying entity is loaded first (without reloading it if it already is loaded). Returns the entity.
     * If the entity is not found in the database (e.g. it was deleted in the meantime, or currently active filters disallow loading of it)
     * the method returns `null`. Use `loadOrFail()` if you want an error to be thrown in such a case.
     */
    load<TT extends T, P extends string = never, F extends string = '*', E extends string = never>(options?: LoadReferenceOptions<TT, P, F, E>): Promise<Loaded<TT, P, F, E> | null>;
    /**
     * Ensures the underlying entity is loaded first (without reloading it if it already is loaded).
     * Returns the entity or throws an error just like `em.findOneOrFail()` (and respects the same config options).
     */
    loadOrFail<TT extends T, P extends string = never, F extends string = '*', E extends string = never>(options?: LoadReferenceOrFailOptions<TT, P, F, E>): Promise<Loaded<TT, P, F, E>>;
    private set;
    unwrap(): T;
    getEntity(): T;
    getProperty<K extends keyof T>(prop: K): T[K];
    loadProperty<TT extends T, P extends string = never, K extends keyof TT = keyof TT>(prop: K, options?: LoadReferenceOrFailOptions<TT, P>): Promise<Loaded<TT, P>[K]>;
    isInitialized(): boolean;
    populated(populated?: boolean): void;
    toJSON(...args: any[]): Dictionary;
    /** @ignore */
    [inspect.custom](depth?: number): string;
}
export declare class ScalarReference<Value> {
    private value?;
    private initialized;
    private entity?;
    private property?;
    constructor(value?: Value | undefined, initialized?: boolean);
    /**
     * Ensures the underlying entity is loaded first (without reloading it if it already is loaded).
     * Returns either the whole entity, or the requested property.
     */
    load(options?: Omit<LoadReferenceOptions<any, any>, 'populate' | 'fields' | 'exclude'>): Promise<Value | undefined>;
    set(value: Value): void;
    bind<Entity extends object>(entity: Entity, property: EntityKey<Entity>): void;
    unwrap(): Value | undefined;
    isInitialized(): boolean;
    /** @ignore */
    [inspect.custom](): string;
}
export interface LoadReferenceOptions<T extends object, P extends string = never, F extends string = '*', E extends string = never> extends FindOneOptions<T, P, F, E> {
    dataloader?: boolean;
}
export interface LoadReferenceOrFailOptions<T extends object, P extends string = never, F extends string = '*', E extends string = never> extends FindOneOrFailOptions<T, P, F, E> {
    dataloader?: boolean;
}
/**
 * shortcut for `wrap(entity).toReference()`
 */
export declare function ref<T>(entity: T | Ref<T>): Ref<T> & LoadedReference<Loaded<T, AddEager<T>>>;
/**
 * shortcut for `Reference.createFromPK(entityType, pk)`
 */
export declare function ref<T, PKV extends Primary<T> = Primary<T>>(entityType: EntityClass<T>, pk?: T | PKV): Ref<T>;
/**
 * shortcut for `wrap(entity).toReference()`
 */
export declare function ref<T>(value: T | Ref<T>): Ref<T> & LoadedReference<Loaded<T, AddEager<T>>>;
/**
 * shortcut for `Reference.createNakedFromPK(entityType, pk)`
 */
export declare function rel<T, PK extends Primary<T>>(entityType: EntityClass<T>, pk: T | PK): T;
export { Reference as Ref };
