import { EntityMetadata, type Dictionary, type EntityData, type EntityName } from '../typings';
import type { EntityManager } from '../EntityManager';
export declare class MetadataStorage {
    static readonly PATH_SYMBOL: unique symbol;
    private static readonly metadata;
    private readonly metadata;
    constructor(metadata?: Dictionary<EntityMetadata>);
    static getMetadata(): Dictionary<EntityMetadata>;
    static getMetadata<T = any>(entity: string, path: string): EntityMetadata<T>;
    static isKnownEntity(name: string): boolean;
    static getMetadataFromDecorator<T = any>(target: T & Dictionary & {
        [MetadataStorage.PATH_SYMBOL]?: string;
    }): EntityMetadata<T>;
    static init(): MetadataStorage;
    static clear(): void;
    getAll(): Dictionary<EntityMetadata>;
    getByDiscriminatorColumn<T>(meta: EntityMetadata<T>, data: EntityData<T>): EntityMetadata<T> | undefined;
    get<T = any>(entityName: EntityName<T>, init?: boolean, validate?: boolean): EntityMetadata<T>;
    find<T = any>(entityName: EntityName<T>): EntityMetadata<T> | undefined;
    has(entity: string): boolean;
    set(entity: string, meta: EntityMetadata): EntityMetadata;
    reset(entity: string): void;
    decorate(em: EntityManager): void;
    [Symbol.iterator](): IterableIterator<EntityMetadata>;
}
