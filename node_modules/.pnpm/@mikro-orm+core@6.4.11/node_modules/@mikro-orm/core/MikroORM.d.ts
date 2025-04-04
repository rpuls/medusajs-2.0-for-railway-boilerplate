import type { EntityManagerType, IDatabaseDriver } from './drivers';
import { MetadataStorage, type EntitySchema } from './metadata';
import { Configuration, type Options } from './utils';
import type { EntityManager } from './EntityManager';
import type { Constructor, EntityMetadata, EntityName, IEntityGenerator, IMigrator, ISeedManager } from './typings';
/**
 * Helper class for bootstrapping the MikroORM.
 */
export declare class MikroORM<D extends IDatabaseDriver = IDatabaseDriver, EM extends EntityManager = D[typeof EntityManagerType] & EntityManager> {
    /** The global EntityManager instance. If you are using `RequestContext` helper, it will automatically pick the request specific context under the hood */
    em: EM;
    readonly config: Configuration<D>;
    private metadata;
    private readonly driver;
    private readonly logger;
    private readonly discovery;
    /**
     * Initialize the ORM, load entity metadata, create EntityManager and connect to the database.
     * If you omit the `options` parameter, your CLI config will be used.
     */
    static init<D extends IDatabaseDriver = IDatabaseDriver, EM extends EntityManager = D[typeof EntityManagerType] & EntityManager>(options?: Options<D, EM>): Promise<MikroORM<D, EM>>;
    /**
     * Synchronous variant of the `init` method with some limitations:
     * - database connection will be established when you first interact with the database (or you can use `orm.connect()` explicitly)
     * - no loading of the `config` file, `options` parameter is mandatory
     * - no support for folder based discovery
     * - no check for mismatched package versions
     */
    static initSync<D extends IDatabaseDriver = IDatabaseDriver, EM extends EntityManager = D[typeof EntityManagerType] & EntityManager>(options: Options<D, EM>): MikroORM<D, EM>;
    constructor(options: Options<D, EM> | Configuration<D, EM>);
    /**
     * Connects to the database.
     */
    connect(): Promise<D>;
    /**
     * Reconnects, possibly to a different database.
     */
    reconnect(options?: Options): Promise<void>;
    /**
     * Checks whether the database connection is active.
     */
    isConnected(): Promise<boolean>;
    /**
     * Checks whether the database connection is active, returns .
     */
    checkConnection(): Promise<{
        ok: true;
    } | {
        ok: false;
        reason: string;
        error?: Error;
    }>;
    /**
     * Closes the database connection.
     */
    close(force?: boolean): Promise<void>;
    /**
     * Gets the `MetadataStorage`.
     */
    getMetadata(): MetadataStorage;
    /**
     * Gets the `EntityMetadata` instance when provided with the `entityName` parameter.
     */
    getMetadata<Entity extends object>(entityName: EntityName<Entity>): EntityMetadata<Entity>;
    discoverEntities(): Promise<void>;
    discoverEntitiesSync(): void;
    private createEntityManager;
    /**
     * Allows dynamically discovering new entity by reference, handy for testing schema diffing.
     */
    discoverEntity<T extends Constructor | EntitySchema>(entities: T | T[], reset?: string | string[]): void;
    /**
     * Gets the SchemaGenerator.
     */
    getSchemaGenerator(): ReturnType<ReturnType<D['getPlatform']>['getSchemaGenerator']>;
    /**
     * Gets the EntityGenerator.
     */
    getEntityGenerator<T extends IEntityGenerator = IEntityGenerator>(): T;
    /**
     * Gets the Migrator.
     */
    getMigrator<T extends IMigrator = IMigrator>(): T;
    /**
     * Gets the SeedManager
     */
    getSeeder<T extends ISeedManager = ISeedManager>(): T;
    /**
     * Shortcut for `orm.getSchemaGenerator()`
     */
    get schema(): ReturnType<ReturnType<D["getPlatform"]>["getSchemaGenerator"]>;
    /**
     * Shortcut for `orm.getSeeder()`
     */
    get seeder(): ISeedManager;
    /**
     * Shortcut for `orm.getMigrator()`
     */
    get migrator(): IMigrator;
    /**
     * Shortcut for `orm.getEntityGenerator()`
     */
    get entityGenerator(): IEntityGenerator;
}
