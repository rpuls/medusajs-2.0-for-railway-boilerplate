import { MikroORM, type Options, type IDatabaseDriver, type EntityManager, type EntityManagerType } from '@mikro-orm/core';
import { PostgreSqlDriver } from './PostgreSqlDriver';
import type { SqlEntityManager } from '@mikro-orm/knex';
/**
 * @inheritDoc
 */
export declare class PostgreSqlMikroORM<EM extends EntityManager = SqlEntityManager> extends MikroORM<PostgreSqlDriver, EM> {
    private static DRIVER;
    /**
     * @inheritDoc
     */
    static init<D extends IDatabaseDriver = PostgreSqlDriver, EM extends EntityManager = D[typeof EntityManagerType] & EntityManager>(options?: Options<D, EM>): Promise<MikroORM<D, EM>>;
    /**
     * @inheritDoc
     */
    static initSync<D extends IDatabaseDriver = PostgreSqlDriver, EM extends EntityManager = D[typeof EntityManagerType] & EntityManager>(options: Options<D, EM>): MikroORM<D, EM>;
}
export type PostgreSqlOptions = Options<PostgreSqlDriver>;
export declare function definePostgreSqlConfig(options: PostgreSqlOptions): Options<PostgreSqlDriver, SqlEntityManager<PostgreSqlDriver> & EntityManager<IDatabaseDriver<import("@mikro-orm/core").Connection>>>;
