import { type Dictionary, type EntityKey, type EntityMetadata, type MetadataStorage } from '@mikro-orm/core';
import type { ICriteriaNode } from '../typings';
/**
 * @internal
 */
export declare class CriteriaNodeFactory {
    static createNode<T extends object>(metadata: MetadataStorage, entityName: string, payload: any, parent?: ICriteriaNode<T>, key?: EntityKey<T>): ICriteriaNode<T>;
    static createScalarNode<T extends object>(metadata: MetadataStorage, entityName: string, payload: any, parent?: ICriteriaNode<T>, key?: EntityKey<T>): ICriteriaNode<T>;
    static createArrayNode<T extends object>(metadata: MetadataStorage, entityName: string, payload: any[], parent?: ICriteriaNode<T>, key?: EntityKey<T>): ICriteriaNode<T>;
    static createObjectNode<T extends object>(metadata: MetadataStorage, entityName: string, payload: Dictionary, parent?: ICriteriaNode<T>, key?: EntityKey<T>): ICriteriaNode<T>;
    static createObjectItemNode<T extends object>(metadata: MetadataStorage, entityName: string, node: ICriteriaNode<T>, payload: Dictionary, key: EntityKey<T>, meta?: EntityMetadata<T>): ICriteriaNode<T>;
}
