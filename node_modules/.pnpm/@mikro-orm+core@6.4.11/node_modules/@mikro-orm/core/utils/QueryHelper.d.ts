import type { Dictionary, EntityMetadata, EntityProperty, FilterDef, FilterQuery } from '../typings';
import type { Platform } from '../platforms';
import type { MetadataStorage } from '../metadata/MetadataStorage';
export declare class QueryHelper {
    static readonly SUPPORTED_OPERATORS: string[];
    static processParams(params: unknown): any;
    static processObjectParams<T extends object>(params?: T): T;
    static inlinePrimaryKeyObjects<T extends object>(where: Dictionary, meta: EntityMetadata<T>, metadata: MetadataStorage, key?: string): boolean;
    static processWhere<T extends object>(options: ProcessWhereOptions<T>): FilterQuery<T>;
    static getActiveFilters(entityName: string, options: Dictionary<boolean | Dictionary> | string[] | boolean, filters: Dictionary<FilterDef>): FilterDef[];
    static isFilterActive(entityName: string, filterName: string, filter: FilterDef, options: Dictionary<boolean | Dictionary>): boolean;
    static processCustomType<T extends object>(prop: EntityProperty<T>, cond: FilterQuery<T>, platform: Platform, key?: string, fromQuery?: boolean): FilterQuery<T>;
    private static isSupportedOperator;
    private static processJsonCondition;
    private static getValueType;
    static findProperty<T>(fieldName: string, options: ProcessWhereOptions<T>): EntityProperty<T> | undefined;
}
interface ProcessWhereOptions<T> {
    where: FilterQuery<T>;
    entityName: string;
    metadata: MetadataStorage;
    platform: Platform;
    aliased?: boolean;
    aliasMap?: Dictionary<string>;
    convertCustomTypes?: boolean;
    root?: boolean;
    type?: 'where' | 'orderBy';
}
export {};
