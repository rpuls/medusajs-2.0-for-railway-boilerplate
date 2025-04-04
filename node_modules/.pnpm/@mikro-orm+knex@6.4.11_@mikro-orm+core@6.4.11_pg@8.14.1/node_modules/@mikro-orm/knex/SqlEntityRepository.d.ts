import type { Knex } from 'knex';
import { EntityRepository, type ConnectionType, type EntityName } from '@mikro-orm/core';
import type { SqlEntityManager } from './SqlEntityManager';
import type { QueryBuilder } from './query';
export declare class SqlEntityRepository<Entity extends object> extends EntityRepository<Entity> {
    protected readonly em: SqlEntityManager;
    constructor(em: SqlEntityManager, entityName: EntityName<Entity>);
    /**
     * Creates a QueryBuilder instance
     */
    createQueryBuilder<RootAlias extends string = never>(alias?: RootAlias): QueryBuilder<Entity, RootAlias>;
    /**
     * Shortcut for `createQueryBuilder()`
     */
    qb<RootAlias extends string = never>(alias?: RootAlias): QueryBuilder<Entity, RootAlias>;
    /**
     * Returns configured knex instance.
     */
    getKnex(type?: ConnectionType): Knex;
    /**
     * @inheritDoc
     */
    getEntityManager(): SqlEntityManager;
}
