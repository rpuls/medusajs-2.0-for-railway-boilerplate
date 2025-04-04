import type { Knex } from 'knex';
import { EntityManager, type AnyEntity, type ConnectionType, type EntityData, type EntityName, type EntityRepository, type GetRepository, type QueryResult, type FilterQuery, type LoggingOptions } from '@mikro-orm/core';
import type { AbstractSqlDriver } from './AbstractSqlDriver';
import type { QueryBuilder } from './query';
import type { SqlEntityRepository } from './SqlEntityRepository';
/**
 * @inheritDoc
 */
export declare class SqlEntityManager<Driver extends AbstractSqlDriver = AbstractSqlDriver> extends EntityManager<Driver> {
    /**
     * Creates a QueryBuilder instance
     */
    createQueryBuilder<Entity extends object, RootAlias extends string = never>(entityName: EntityName<Entity> | QueryBuilder<Entity>, alias?: RootAlias, type?: ConnectionType, loggerContext?: LoggingOptions): QueryBuilder<Entity, RootAlias>;
    /**
     * Shortcut for `createQueryBuilder()`
     */
    qb<Entity extends object, RootAlias extends string = never>(entityName: EntityName<Entity>, alias?: RootAlias, type?: ConnectionType, loggerContext?: LoggingOptions): QueryBuilder<Entity, RootAlias, never, never>;
    /**
     * Returns configured knex instance.
     */
    getKnex(type?: ConnectionType): Knex<any, any[]>;
    execute<T extends QueryResult | EntityData<AnyEntity> | EntityData<AnyEntity>[] = EntityData<AnyEntity>[]>(queryOrKnex: string | Knex.QueryBuilder | Knex.Raw, params?: any[], method?: 'all' | 'get' | 'run', loggerContext?: LoggingOptions): Promise<T>;
    getRepository<T extends object, U extends EntityRepository<T> = SqlEntityRepository<T>>(entityName: EntityName<T>): GetRepository<T, U>;
    protected applyDiscriminatorCondition<Entity extends object>(entityName: string, where: FilterQuery<Entity>): FilterQuery<Entity>;
}
