import { AbstractSchemaGenerator, type ClearDatabaseOptions, type CreateSchemaOptions, type DropSchemaOptions, type EnsureDatabaseOptions, type ISchemaGenerator, type MikroORM, type Transaction, type UpdateSchemaOptions } from '@mikro-orm/core';
import type { SchemaDifference } from '../typings';
import { DatabaseSchema } from './DatabaseSchema';
import type { AbstractSqlDriver } from '../AbstractSqlDriver';
export declare class SqlSchemaGenerator extends AbstractSchemaGenerator<AbstractSqlDriver> implements ISchemaGenerator {
    protected readonly helper: import("./SchemaHelper").SchemaHelper;
    protected readonly options: {
        disableForeignKeys?: boolean;
        createForeignKeyConstraints?: boolean;
        ignoreSchema?: string[];
        managementDbName?: string;
    };
    protected lastEnsuredDatabase?: string;
    static register(orm: MikroORM): void;
    createSchema(options?: CreateSchemaOptions): Promise<void>;
    /**
     * Returns true if the database was created.
     */
    ensureDatabase(options?: EnsureDatabaseOptions): Promise<boolean>;
    getTargetSchema(schema?: string): DatabaseSchema;
    getCreateSchemaSQL(options?: CreateSchemaOptions): Promise<string>;
    dropSchema(options?: DropSchemaOptions): Promise<void>;
    createNamespace(name: string): Promise<void>;
    dropNamespace(name: string): Promise<void>;
    clearDatabase(options?: ClearDatabaseOptions): Promise<void>;
    getDropSchemaSQL(options?: Omit<DropSchemaOptions, 'dropDb'>): Promise<string>;
    private getSchemaName;
    updateSchema(options?: UpdateSchemaOptions<DatabaseSchema>): Promise<void>;
    getUpdateSchemaSQL(options?: UpdateSchemaOptions<DatabaseSchema>): Promise<string>;
    getUpdateSchemaMigrationSQL(options?: UpdateSchemaOptions<DatabaseSchema>): Promise<{
        up: string;
        down: string;
    }>;
    private prepareSchemaForComparison;
    diffToSQL(schemaDiff: SchemaDifference, options: {
        wrap?: boolean;
        safe?: boolean;
        dropTables?: boolean;
        schema?: string;
    }): Promise<string>;
    /**
     * We need to drop foreign keys first for all tables to allow dropping PK constraints.
     */
    private preAlterTable;
    private postAlterTable;
    private alterTable;
    /**
     * creates new database and connects to it
     */
    createDatabase(name?: string): Promise<void>;
    dropDatabase(name?: string): Promise<void>;
    execute(sql: string, options?: {
        wrap?: boolean;
        ctx?: Transaction;
    }): Promise<void>;
    private wrapSchema;
    private dropIndex;
    private dropCheck;
    private dropTable;
    private createForeignKeys;
    private dump;
    private get knex();
}
export { SqlSchemaGenerator as SchemaGenerator };
