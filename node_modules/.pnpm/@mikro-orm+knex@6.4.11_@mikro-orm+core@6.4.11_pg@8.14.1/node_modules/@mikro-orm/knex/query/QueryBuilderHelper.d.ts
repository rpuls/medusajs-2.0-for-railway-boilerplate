import type { Knex } from 'knex';
import { type Dictionary, type EntityData, type EntityKey, type EntityMetadata, type EntityProperty, type FlatQueryOrderMap, LockMode, type QBFilterQuery, RawQueryFragment } from '@mikro-orm/core';
import { JoinType, QueryType } from './enums';
import type { Field, JoinOptions } from '../typings';
import type { AbstractSqlDriver } from '../AbstractSqlDriver';
/**
 * @internal
 */
export declare class QueryBuilderHelper {
    private readonly entityName;
    private readonly alias;
    private readonly aliasMap;
    private readonly subQueries;
    private readonly knex;
    private readonly driver;
    private readonly platform;
    private readonly metadata;
    constructor(entityName: string, alias: string, aliasMap: Dictionary<Alias<any>>, subQueries: Dictionary<string>, knex: Knex, driver: AbstractSqlDriver);
    mapper(field: string | Knex.Raw, type?: QueryType): string;
    mapper(field: string | Knex.Raw, type?: QueryType, value?: any, alias?: string | null): string;
    processData(data: Dictionary, convertCustomTypes: boolean, multi?: boolean): any;
    joinOneToReference(prop: EntityProperty, ownerAlias: string, alias: string, type: JoinType, cond?: Dictionary, schema?: string): JoinOptions;
    joinManyToOneReference(prop: EntityProperty, ownerAlias: string, alias: string, type: JoinType, cond?: Dictionary, schema?: string): JoinOptions;
    joinManyToManyReference(prop: EntityProperty, ownerAlias: string, alias: string, pivotAlias: string, type: JoinType, cond: Dictionary, path: string, schema?: string): Dictionary<JoinOptions>;
    processJoins(qb: Knex.QueryBuilder, joins: Dictionary<JoinOptions>, schema?: string): void;
    createJoinExpression(join: JoinOptions, joins: Dictionary<JoinOptions>, schema?: string): {
        sql: string;
        params: Knex.Value[];
    };
    private processJoinClause;
    private wrapQueryGroup;
    mapJoinColumns(type: QueryType, join: JoinOptions): (string | Knex.Raw)[];
    isOneToOneInverse(field: string, meta?: EntityMetadata): boolean;
    getTableName(entityName: string): string;
    /**
     * Checks whether the RE can be rewritten to simple LIKE query
     */
    isSimpleRegExp(re: any): re is RegExp;
    getRegExpParam(re: RegExp): string;
    appendOnConflictClause<T>(type: QueryType, onConflict: {
        fields: string[] | RawQueryFragment;
        ignore?: boolean;
        merge?: EntityData<T> | Field<T>[];
        where?: QBFilterQuery<T>;
    }[], qb: Knex.QueryBuilder): void;
    appendQueryCondition(type: QueryType, cond: any, qb: Knex.QueryBuilder, operator?: '$and' | '$or', method?: 'where' | 'having'): void;
    private appendQuerySubCondition;
    private processObjectSubCondition;
    private getOperatorReplacement;
    getQueryOrder(type: QueryType, orderBy: FlatQueryOrderMap | FlatQueryOrderMap[], populate: Dictionary<string>): string[];
    getQueryOrderFromObject(type: QueryType, orderBy: FlatQueryOrderMap, populate: Dictionary<string>): string[];
    finalize(type: QueryType, qb: Knex.QueryBuilder, meta?: EntityMetadata, data?: Dictionary, returning?: Field<any>[]): void;
    splitField<T>(field: EntityKey<T>, greedyAlias?: boolean): [string, EntityKey<T>, string | undefined];
    getLockSQL(qb: Knex.QueryBuilder, lockMode: LockMode, lockTables?: string[]): void;
    updateVersionProperty(qb: Knex.QueryBuilder, data: Dictionary): void;
    private prefix;
    private appendGroupCondition;
    private isPrefixed;
    private fieldName;
    getProperty(field: string, alias?: string): EntityProperty | undefined;
    isTableNameAliasRequired(type?: QueryType): boolean;
    processOnConflictCondition(cond: QBFilterQuery, schema?: string): QBFilterQuery;
}
export interface Alias<T> {
    aliasName: string;
    entityName: string;
    metadata?: EntityMetadata<T>;
    subQuery?: Knex.QueryBuilder;
}
