import { inspect } from 'node:util';
import { type EntityKey, type EntityProperty, type MetadataStorage } from '@mikro-orm/core';
import type { ICriteriaNode, ICriteriaNodeProcessOptions, IQueryBuilder } from '../typings';
/**
 * Helper for working with deeply nested where/orderBy/having criteria. Uses composite pattern to build tree from the payload.
 * Auto-joins relations and converts payload from { books: { publisher: { name: '...' } } } to { 'publisher_alias.name': '...' }
 * @internal
 */
export declare class CriteriaNode<T extends object> implements ICriteriaNode<T> {
    protected readonly metadata: MetadataStorage;
    readonly entityName: string;
    readonly parent?: ICriteriaNode<T> | undefined;
    readonly key?: EntityKey<T> | undefined;
    payload: any;
    prop?: EntityProperty<T>;
    index?: number;
    constructor(metadata: MetadataStorage, entityName: string, parent?: ICriteriaNode<T> | undefined, key?: EntityKey<T> | undefined, validate?: boolean);
    process(qb: IQueryBuilder<T>, options?: ICriteriaNodeProcessOptions): any;
    unwrap(): any;
    shouldInline(payload: any): boolean;
    willAutoJoin(qb: IQueryBuilder<T>, alias?: string, options?: ICriteriaNodeProcessOptions): boolean;
    shouldRename(payload: any): boolean;
    renameFieldToPK<T>(qb: IQueryBuilder<T>): string;
    getPath(addIndex?: boolean): string;
    private isPivotJoin;
    getPivotPath(path: string): string;
    aliased(field: string, alias?: string): string;
    /** @ignore */
    [inspect.custom](): string;
}
