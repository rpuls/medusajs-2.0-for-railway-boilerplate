import type { ClearDatabaseOptions, DropSchemaOptions, EntityMetadata, ISchemaGenerator, UpdateSchemaOptions, CreateSchemaOptions, RefreshDatabaseOptions, EnsureDatabaseOptions } from '../typings';
import type { IDatabaseDriver } from '../drivers/IDatabaseDriver';
import type { MetadataStorage } from '../metadata/MetadataStorage';
import type { Configuration } from './Configuration';
export declare abstract class AbstractSchemaGenerator<D extends IDatabaseDriver> implements ISchemaGenerator {
    protected readonly em?: ReturnType<D['createEntityManager']>;
    protected readonly driver: D;
    protected readonly config: Configuration;
    protected readonly metadata: MetadataStorage;
    protected readonly platform: ReturnType<D['getPlatform']>;
    protected readonly connection: ReturnType<D['getConnection']>;
    constructor(em: D | ReturnType<D['createEntityManager']>);
    createSchema(options?: CreateSchemaOptions): Promise<void>;
    /**
     * Returns true if the database was created.
     */
    ensureDatabase(options?: EnsureDatabaseOptions): Promise<boolean>;
    refreshDatabase(options?: RefreshDatabaseOptions): Promise<void>;
    clearDatabase(options?: ClearDatabaseOptions): Promise<void>;
    protected clearIdentityMap(): void;
    getCreateSchemaSQL(options?: CreateSchemaOptions): Promise<string>;
    dropSchema(options?: DropSchemaOptions): Promise<void>;
    getDropSchemaSQL(options?: Omit<DropSchemaOptions, 'dropDb'>): Promise<string>;
    updateSchema(options?: UpdateSchemaOptions): Promise<void>;
    getUpdateSchemaSQL(options?: UpdateSchemaOptions): Promise<string>;
    getUpdateSchemaMigrationSQL(options?: UpdateSchemaOptions): Promise<{
        up: string;
        down: string;
    }>;
    /**
     * creates new database and connects to it
     */
    createDatabase(name?: string): Promise<void>;
    dropDatabase(name?: string): Promise<void>;
    execute(query: string): Promise<void>;
    ensureIndexes(): Promise<void>;
    protected getOrderedMetadata(schema?: string): EntityMetadata[];
    protected notImplemented(): never;
}
