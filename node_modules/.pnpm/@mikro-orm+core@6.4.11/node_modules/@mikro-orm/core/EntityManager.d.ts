import { inspect } from 'node:util';
import DataLoader from 'dataloader';
import { type Configuration, Cursor } from './utils';
import { type AssignOptions, EntityFactory, type EntityLoaderOptions, type EntityRepository, EntityValidator, Reference } from './entity';
import { UnitOfWork } from './unit-of-work';
import type { CountOptions, DeleteOptions, FindAllOptions, FindByCursorOptions, FindOneOptions, FindOneOrFailOptions, FindOptions, GetReferenceOptions, IDatabaseDriver, LockOptions, NativeInsertUpdateOptions, UpdateOptions, UpsertManyOptions, UpsertOptions } from './drivers';
import type { AnyEntity, AnyString, ArrayElement, AutoPath, ConnectionType, Dictionary, EntityData, EntityDictionary, EntityDTO, EntityMetadata, EntityName, FilterQuery, FromEntityType, GetRepository, IHydrator, IsSubset, Loaded, MaybePromise, MergeLoaded, MergeSelected, NoInfer, ObjectQuery, Primary, Ref, RequiredEntityData, UnboxArray } from './typings';
import { FlushMode, LockMode, PopulatePath, type TransactionOptions } from './enums';
import type { MetadataStorage } from './metadata';
import type { Transaction } from './connections';
import { EventManager } from './events';
import type { EntityComparator } from './utils/EntityComparator';
/**
 * The EntityManager is the central access point to ORM functionality. It is a facade to all different ORM subsystems
 * such as UnitOfWork, Query Language, and Repository API.
 * @template {IDatabaseDriver} Driver current driver type
 */
export declare class EntityManager<Driver extends IDatabaseDriver = IDatabaseDriver> {
    readonly config: Configuration;
    protected readonly driver: Driver;
    protected readonly metadata: MetadataStorage;
    protected readonly useContext: boolean;
    protected readonly eventManager: EventManager;
    private static counter;
    readonly _id: number;
    readonly global = false;
    readonly name: string;
    protected readonly refLoader: DataLoader<[Reference<any>, (Omit<import("./entity").LoadReferenceOptions<any, any, "*", never>, "dataloader"> | undefined)?], any, [Reference<any>, (Omit<import("./entity").LoadReferenceOptions<any, any, "*", never>, "dataloader"> | undefined)?]>;
    protected readonly colLoader: DataLoader<[import("./entity").Collection<any, object>, (Omit<import("./entity").InitCollectionOptions<any, any, "*", never>, "dataloader"> | undefined)?], any, [import("./entity").Collection<any, object>, (Omit<import("./entity").InitCollectionOptions<any, any, "*", never>, "dataloader"> | undefined)?]>;
    private readonly validator;
    private readonly repositoryMap;
    private readonly entityLoader;
    protected readonly comparator: EntityComparator;
    private readonly entityFactory;
    private readonly unitOfWork;
    private readonly resultCache;
    private filters;
    private filterParams;
    protected loggerContext?: Dictionary;
    private transactionContext?;
    private disableTransactions;
    private flushMode?;
    private _schema?;
    /**
     * @internal
     */
    constructor(config: Configuration, driver: Driver, metadata: MetadataStorage, useContext?: boolean, eventManager?: EventManager);
    /**
     * Gets the Driver instance used by this EntityManager.
     * Driver is singleton, for one MikroORM instance, only one driver is created.
     */
    getDriver(): Driver;
    /**
     * Gets the Connection instance, by default returns write connection
     */
    getConnection(type?: ConnectionType): ReturnType<Driver['getConnection']>;
    /**
     * Gets the platform instance. Just like the driver, platform is singleton, one for a MikroORM instance.
     */
    getPlatform(): ReturnType<Driver['getPlatform']>;
    /**
     * Gets repository for given entity. You can pass either string name or entity class reference.
     */
    getRepository<Entity extends object, Repository extends EntityRepository<Entity> = EntityRepository<Entity>>(entityName: EntityName<Entity>): GetRepository<Entity, Repository>;
    /**
     * Shortcut for `em.getRepository()`.
     */
    repo<Entity extends object, Repository extends EntityRepository<Entity> = EntityRepository<Entity>>(entityName: EntityName<Entity>): GetRepository<Entity, Repository>;
    /**
     * Gets EntityValidator instance
     */
    getValidator(): EntityValidator;
    /**
     * Finds all entities matching your `where` query. You can pass additional options via the `options` parameter.
     */
    find<Entity extends object, Hint extends string = never, Fields extends string = PopulatePath.ALL, Excludes extends string = never>(entityName: EntityName<Entity>, where: FilterQuery<NoInfer<Entity>>, options?: FindOptions<Entity, Hint, Fields, Excludes>): Promise<Loaded<Entity, Hint, Fields, Excludes>[]>;
    /**
     * Finds all entities of given type, optionally matching the `where` condition provided in the `options` parameter.
     */
    findAll<Entity extends object, Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(entityName: EntityName<Entity>, options?: FindAllOptions<NoInfer<Entity>, Hint, Fields, Excludes>): Promise<Loaded<Entity, Hint, Fields, Excludes>[]>;
    private getPopulateWhere;
    /**
     * Registers global filter to this entity manager. Global filters are enabled by default (unless disabled via last parameter).
     */
    addFilter<T1>(name: string, cond: FilterQuery<T1> | ((args: Dictionary) => MaybePromise<FilterQuery<T1>>), entityName?: EntityName<T1> | [EntityName<T1>], enabled?: boolean): void;
    /**
     * Registers global filter to this entity manager. Global filters are enabled by default (unless disabled via last parameter).
     */
    addFilter<T1, T2>(name: string, cond: FilterQuery<T1 | T2> | ((args: Dictionary) => MaybePromise<FilterQuery<T1 | T2>>), entityName?: [EntityName<T1>, EntityName<T2>], enabled?: boolean): void;
    /**
     * Registers global filter to this entity manager. Global filters are enabled by default (unless disabled via last parameter).
     */
    addFilter<T1, T2, T3>(name: string, cond: FilterQuery<T1 | T2 | T3> | ((args: Dictionary) => MaybePromise<FilterQuery<T1 | T2 | T3>>), entityName?: [EntityName<T1>, EntityName<T2>, EntityName<T3>], enabled?: boolean): void;
    /**
     * Registers global filter to this entity manager. Global filters are enabled by default (unless disabled via last parameter).
     */
    addFilter(name: string, cond: Dictionary | ((args: Dictionary) => MaybePromise<FilterQuery<AnyEntity>>), entityName?: EntityName<AnyEntity> | EntityName<AnyEntity>[], enabled?: boolean): void;
    /**
     * Sets filter parameter values globally inside context defined by this entity manager.
     * If you want to set shared value for all contexts, be sure to use the root entity manager.
     */
    setFilterParams(name: string, args: Dictionary): void;
    /**
     * Returns filter parameters for given filter set in this context.
     */
    getFilterParams<T extends Dictionary = Dictionary>(name: string): T;
    /**
     * Sets logger context for this entity manager.
     */
    setLoggerContext(context: Dictionary): void;
    /**
     * Gets logger context for this entity manager.
     */
    getLoggerContext<T extends Dictionary = Dictionary>(): T;
    setFlushMode(flushMode?: FlushMode): void;
    protected processWhere<Entity extends object, Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(entityName: string, where: FilterQuery<Entity>, options: FindOptions<Entity, Hint, Fields, Excludes> | FindOneOptions<Entity, Hint, Fields, Excludes>, type: 'read' | 'update' | 'delete'): Promise<FilterQuery<Entity>>;
    protected applyDiscriminatorCondition<Entity extends object>(entityName: string, where: FilterQuery<Entity>): FilterQuery<Entity>;
    protected createPopulateWhere<Entity extends object>(cond: ObjectQuery<Entity>, options: FindOptions<Entity, any, any, any> | FindOneOptions<Entity, any, any, any> | CountOptions<Entity, any>): ObjectQuery<Entity>;
    protected getJoinedFilters<Entity extends object>(meta: EntityMetadata<Entity>, cond: ObjectQuery<Entity>, options: FindOptions<Entity, any, any, any> | FindOneOptions<Entity, any, any, any>): Promise<ObjectQuery<Entity>>;
    /**
     * When filters are active on M:1 or 1:1 relations, we need to ref join them eagerly as they might affect the FK value.
     */
    protected autoJoinRefsForFilters<T extends object>(meta: EntityMetadata<T>, options: FindOptions<T, any, any, any> | FindOneOptions<T, any, any, any>): Promise<void>;
    /**
     * @internal
     */
    applyFilters<Entity extends object>(entityName: string, where: FilterQuery<Entity> | undefined, options: Dictionary<boolean | Dictionary> | string[] | boolean, type: 'read' | 'update' | 'delete', findOptions?: FindOptions<any, any, any, any> | FindOneOptions<any, any, any, any>): Promise<FilterQuery<Entity> | undefined>;
    /**
     * Calls `em.find()` and `em.count()` with the same arguments (where applicable) and returns the results as tuple
     * where the first element is the array of entities, and the second is the count.
     */
    findAndCount<Entity extends object, Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(entityName: EntityName<Entity>, where: FilterQuery<NoInfer<Entity>>, options?: FindOptions<Entity, Hint, Fields, Excludes>): Promise<[Loaded<Entity, Hint, Fields, Excludes>[], number]>;
    /**
     * Calls `em.find()` and `em.count()` with the same arguments (where applicable) and returns the results as {@apilink Cursor} object.
     * Supports `before`, `after`, `first` and `last` options while disallowing `limit` and `offset`. Explicit `orderBy` option
     * is required.
     *
     * Use `first` and `after` for forward pagination, or `last` and `before` for backward pagination.
     *
     * - `first` and `last` are numbers and serve as an alternative to `offset`, those options are mutually exclusive, use only one at a time
     * - `before` and `after` specify the previous cursor value, it can be one of the:
     *     - `Cursor` instance
     *     - opaque string provided by `startCursor/endCursor` properties
     *     - POJO/entity instance
     *
     * ```ts
     * const currentCursor = await em.findByCursor(User, {}, {
     *   first: 10,
     *   after: previousCursor, // cursor instance
     *   orderBy: { id: 'desc' },
     * });
     *
     * // to fetch next page
     * const nextCursor = await em.findByCursor(User, {}, {
     *   first: 10,
     *   after: currentCursor.endCursor, // opaque string
     *   orderBy: { id: 'desc' },
     * });
     *
     * // to fetch next page
     * const nextCursor2 = await em.findByCursor(User, {}, {
     *   first: 10,
     *   after: { id: lastSeenId }, // entity-like POJO
     *   orderBy: { id: 'desc' },
     * });
     * ```
     *
     * The `Cursor` object provides the following interface:
     *
     * ```ts
     * Cursor<User> {
     *   items: [
     *     User { ... },
     *     User { ... },
     *     User { ... },
     *   ],
     *   totalCount: 50,
     *   startCursor: 'WzRd',
     *   endCursor: 'WzZd',
     *   hasPrevPage: true,
     *   hasNextPage: true,
     * }
     * ```
     */
    findByCursor<Entity extends object, Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(entityName: EntityName<Entity>, where: FilterQuery<NoInfer<Entity>>, options: FindByCursorOptions<Entity, Hint, Fields, Excludes>): Promise<Cursor<Entity, Hint, Fields, Excludes>>;
    /**
     * Refreshes the persistent state of an entity from the database, overriding any local changes that have not yet been
     * persisted. Returns the same entity instance (same object reference), but re-hydrated. If the entity is no longer
     * in database, the method throws an error just like `em.findOneOrFail()` (and respects the same config options).
     */
    refreshOrFail<Entity extends object, Naked extends FromEntityType<Entity> = FromEntityType<Entity>, Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(entity: Entity, options?: FindOneOrFailOptions<Entity, Hint, Fields, Excludes>): Promise<MergeLoaded<Entity, Naked, Hint, Fields, Excludes, true>>;
    /**
     * Refreshes the persistent state of an entity from the database, overriding any local changes that have not yet been
     * persisted. Returns the same entity instance (same object reference), but re-hydrated. If the entity is no longer
     * in database, the method returns `null`.
     */
    refresh<Entity extends object, Naked extends FromEntityType<Entity> = FromEntityType<Entity>, Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(entity: Entity, options?: FindOneOptions<Entity, Hint, Fields, Excludes>): Promise<MergeLoaded<Entity, Naked, Hint, Fields, Excludes, true> | null>;
    /**
     * Finds first entity matching your `where` query.
     */
    findOne<Entity extends object, Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(entityName: EntityName<Entity>, where: FilterQuery<NoInfer<Entity>>, options?: FindOneOptions<Entity, Hint, Fields, Excludes>): Promise<Loaded<Entity, Hint, Fields, Excludes> | null>;
    /**
     * Finds first entity matching your `where` query. If nothing found, it will throw an error.
     * If the `strict` option is specified and nothing is found or more than one matching entity is found, it will throw an error.
     * You can override the factory for creating this method via `options.failHandler` locally
     * or via `Configuration.findOneOrFailHandler` (`findExactlyOneOrFailHandler` when specifying `strict`) globally.
     */
    findOneOrFail<Entity extends object, Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(entityName: EntityName<Entity>, where: FilterQuery<NoInfer<Entity>>, options?: FindOneOrFailOptions<Entity, Hint, Fields, Excludes>): Promise<Loaded<Entity, Hint, Fields, Excludes>>;
    /**
     * Creates or updates the entity, based on whether it is already present in the database.
     * This method performs an `insert on conflict merge` query ensuring the database is in sync, returning a managed
     * entity instance. The method accepts either `entityName` together with the entity `data`, or just entity instance.
     *
     * ```ts
     * // insert into "author" ("age", "email") values (33, 'foo@bar.com') on conflict ("email") do update set "age" = 41
     * const author = await em.upsert(Author, { email: 'foo@bar.com', age: 33 });
     * ```
     *
     * The entity data needs to contain either the primary key, or any other unique property. Let's consider the following example, where `Author.email` is a unique property:
     *
     * ```ts
     * // insert into "author" ("age", "email") values (33, 'foo@bar.com') on conflict ("email") do update set "age" = 41
     * // select "id" from "author" where "email" = 'foo@bar.com'
     * const author = await em.upsert(Author, { email: 'foo@bar.com', age: 33 });
     * ```
     *
     * Depending on the driver support, this will either use a returning query, or a separate select query, to fetch the primary key if it's missing from the `data`.
     *
     * If the entity is already present in current context, there won't be any queries - instead, the entity data will be assigned and an explicit `flush` will be required for those changes to be persisted.
     */
    upsert<Entity extends object, Fields extends string = any>(entityNameOrEntity: EntityName<Entity> | Entity, data?: EntityData<Entity> | NoInfer<Entity>, options?: UpsertOptions<Entity, Fields>): Promise<Entity>;
    /**
     * Creates or updates the entity, based on whether it is already present in the database.
     * This method performs an `insert on conflict merge` query ensuring the database is in sync, returning a managed
     * entity instance. The method accepts either `entityName` together with the entity `data`, or just entity instance.
     *
     * ```ts
     * // insert into "author" ("age", "email") values (33, 'foo@bar.com') on conflict ("email") do update set "age" = 41
     * const authors = await em.upsertMany(Author, [{ email: 'foo@bar.com', age: 33 }, ...]);
     * ```
     *
     * The entity data needs to contain either the primary key, or any other unique property. Let's consider the following example, where `Author.email` is a unique property:
     *
     * ```ts
     * // insert into "author" ("age", "email") values (33, 'foo@bar.com'), (666, 'lol@lol.lol') on conflict ("email") do update set "age" = excluded."age"
     * // select "id" from "author" where "email" = 'foo@bar.com'
     * const author = await em.upsertMany(Author, [
     *   { email: 'foo@bar.com', age: 33 },
     *   { email: 'lol@lol.lol', age: 666 },
     * ]);
     * ```
     *
     * Depending on the driver support, this will either use a returning query, or a separate select query, to fetch the primary key if it's missing from the `data`.
     *
     * If the entity is already present in current context, there won't be any queries - instead, the entity data will be assigned and an explicit `flush` will be required for those changes to be persisted.
     */
    upsertMany<Entity extends object, Fields extends string = any>(entityNameOrEntity: EntityName<Entity> | Entity[], data?: (EntityData<Entity> | NoInfer<Entity>)[], options?: UpsertManyOptions<Entity, Fields>): Promise<Entity[]>;
    /**
     * Runs your callback wrapped inside a database transaction.
     */
    transactional<T>(cb: (em: this) => T | Promise<T>, options?: TransactionOptions): Promise<T>;
    /**
     * Starts new transaction bound to this EntityManager. Use `ctx` parameter to provide the parent when nesting transactions.
     */
    begin(options?: Omit<TransactionOptions, 'ignoreNestedTransactions'>): Promise<void>;
    /**
     * Commits the transaction bound to this EntityManager. Flushes before doing the actual commit query.
     */
    commit(): Promise<void>;
    /**
     * Rollbacks the transaction bound to this EntityManager.
     */
    rollback(): Promise<void>;
    /**
     * Runs your callback wrapped inside a database transaction.
     */
    lock<T extends object>(entity: T, lockMode: LockMode, options?: LockOptions | number | Date): Promise<void>;
    /**
     * Fires native insert query. Calling this has no side effects on the context (identity map).
     */
    insert<Entity extends object>(entityNameOrEntity: EntityName<Entity> | Entity, data?: RequiredEntityData<Entity> | Entity, options?: NativeInsertUpdateOptions<Entity>): Promise<Primary<Entity>>;
    /**
     * Fires native multi-insert query. Calling this has no side effects on the context (identity map).
     */
    insertMany<Entity extends object>(entityNameOrEntities: EntityName<Entity> | Entity[], data?: RequiredEntityData<Entity>[] | Entity[], options?: NativeInsertUpdateOptions<Entity>): Promise<Primary<Entity>[]>;
    /**
     * Fires native update query. Calling this has no side effects on the context (identity map).
     */
    nativeUpdate<Entity extends object>(entityName: EntityName<Entity>, where: FilterQuery<NoInfer<Entity>>, data: EntityData<Entity>, options?: UpdateOptions<Entity>): Promise<number>;
    /**
     * Fires native delete query. Calling this has no side effects on the context (identity map).
     */
    nativeDelete<Entity extends object>(entityName: EntityName<Entity>, where: FilterQuery<NoInfer<Entity>>, options?: DeleteOptions<Entity>): Promise<number>;
    /**
     * Maps raw database result to an entity and merges it to this EntityManager.
     */
    map<Entity extends object>(entityName: EntityName<Entity>, result: EntityDictionary<Entity>, options?: {
        schema?: string;
    }): Entity;
    /**
     * Merges given entity to this EntityManager so it becomes managed. You can force refreshing of existing entities
     * via second parameter. By default, it will return already loaded entities without modifying them.
     */
    merge<Entity extends object>(entity: Entity, options?: MergeOptions): Entity;
    /**
     * Merges given entity to this EntityManager so it becomes managed. You can force refreshing of existing entities
     * via second parameter. By default, it will return already loaded entities without modifying them.
     */
    merge<Entity extends object>(entityName: EntityName<Entity>, data: EntityData<Entity> | EntityDTO<Entity>, options?: MergeOptions): Entity;
    /**
     * Creates new instance of given entity and populates it with given data.
     * The entity constructor will be used unless you provide `{ managed: true }` in the `options` parameter.
     * The constructor will be given parameters based on the defined constructor of the entity. If the constructor
     * parameter matches a property name, its value will be extracted from `data`. If no matching property exists,
     * the whole `data` parameter will be passed. This means we can also define `constructor(data: Partial<T>)` and
     * `em.create()` will pass the data into it (unless we have a property named `data` too).
     *
     * The parameters are strictly checked, you need to provide all required properties. You can use `OptionalProps`
     * symbol to omit some properties from this check without making them optional. Alternatively, use `partial: true`
     * in the options to disable the strict checks for required properties. This option has no effect on runtime.
     *
     * The newly created entity will be automatically marked for persistence via `em.persist` unless you disable this
     * behavior, either locally via `persist: false` option, or globally via `persistOnCreate` ORM config option.
     */
    create<Entity extends object, Convert extends boolean = false>(entityName: EntityName<Entity>, data: RequiredEntityData<Entity, never, Convert>, options?: CreateOptions<Convert>): Entity;
    /**
     * Creates new instance of given entity and populates it with given data.
     * The entity constructor will be used unless you provide `{ managed: true }` in the `options` parameter.
     * The constructor will be given parameters based on the defined constructor of the entity. If the constructor
     * parameter matches a property name, its value will be extracted from `data`. If no matching property exists,
     * the whole `data` parameter will be passed. This means we can also define `constructor(data: Partial<T>)` and
     * `em.create()` will pass the data into it (unless we have a property named `data` too).
     *
     * The parameters are strictly checked, you need to provide all required properties. You can use `OptionalProps`
     * symbol to omit some properties from this check without making them optional. Alternatively, use `partial: true`
     * in the options to disable the strict checks for required properties. This option has no effect on runtime.
     *
     * The newly created entity will be automatically marked for persistence via `em.persist` unless you disable this
     * behavior, either locally via `persist: false` option, or globally via `persistOnCreate` ORM config option.
     */
    create<Entity extends object, Convert extends boolean = false>(entityName: EntityName<Entity>, data: EntityData<Entity, Convert>, options: CreateOptions<Convert> & {
        partial: true;
    }): Entity;
    /**
     * Shortcut for `wrap(entity).assign(data, { em })`
     */
    assign<Entity extends object, Naked extends FromEntityType<Entity> = FromEntityType<Entity>, Convert extends boolean = false, Data extends EntityData<Naked, Convert> | Partial<EntityDTO<Naked>> = EntityData<Naked, Convert> | Partial<EntityDTO<Naked>>>(entity: Entity | Partial<Entity>, data: Data & IsSubset<EntityData<Naked, Convert>, Data>, options?: AssignOptions<Convert>): MergeSelected<Entity, Naked, keyof Data & string>;
    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference<Entity extends object>(entityName: EntityName<Entity>, id: Primary<Entity>, options: Omit<GetReferenceOptions, 'wrapped'> & {
        wrapped: true;
    }): Ref<Entity>;
    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference<Entity extends object>(entityName: EntityName<Entity>, id: Primary<Entity> | Primary<Entity>[]): Entity;
    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference<Entity extends object>(entityName: EntityName<Entity>, id: Primary<Entity>, options: Omit<GetReferenceOptions, 'wrapped'> & {
        wrapped: false;
    }): Entity;
    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference<Entity extends object>(entityName: EntityName<Entity>, id: Primary<Entity>, options?: GetReferenceOptions): Entity | Reference<Entity>;
    /**
     * Returns total number of entities matching your `where` query.
     */
    count<Entity extends object, Hint extends string = never>(entityName: EntityName<Entity>, where?: FilterQuery<NoInfer<Entity>>, options?: CountOptions<Entity, Hint>): Promise<number>;
    /**
     * Tells the EntityManager to make an instance managed and persistent.
     * The entity will be entered into the database at or before transaction commit or as a result of the flush operation.
     */
    persist<Entity extends object>(entity: Entity | Reference<Entity> | Iterable<Entity | Reference<Entity>>): this;
    /**
     * Persists your entity immediately, flushing all not yet persisted changes to the database too.
     * Equivalent to `em.persist(e).flush()`.
     */
    persistAndFlush(entity: AnyEntity | Reference<AnyEntity> | Iterable<AnyEntity | Reference<AnyEntity>>): Promise<void>;
    /**
     * Marks entity for removal.
     * A removed entity will be removed from the database at or before transaction commit or as a result of the flush operation.
     *
     * To remove entities by condition, use `em.nativeDelete()`.
     */
    remove<Entity extends object>(entity: Entity | Reference<Entity> | Iterable<Entity | Reference<Entity>>): this;
    /**
     * Removes an entity instance immediately, flushing all not yet persisted changes to the database too.
     * Equivalent to `em.remove(e).flush()`
     */
    removeAndFlush(entity: AnyEntity | Reference<AnyEntity> | Iterable<AnyEntity | Reference<AnyEntity>>): Promise<void>;
    /**
     * Flushes all changes to objects that have been queued up to now to the database.
     * This effectively synchronizes the in-memory state of managed objects with the database.
     */
    flush(): Promise<void>;
    /**
     * @internal
     */
    tryFlush<Entity extends object>(entityName: EntityName<Entity>, options: {
        flushMode?: FlushMode | AnyString;
    }): Promise<void>;
    /**
     * Clears the EntityManager. All entities that are currently managed by this EntityManager become detached.
     */
    clear(): void;
    /**
     * Checks whether given property can be populated on the entity.
     */
    canPopulate<Entity extends object>(entityName: EntityName<Entity>, property: string): boolean;
    /**
     * Loads specified relations in batch. This will execute one query for each relation, that will populate it on all the specified entities.
     */
    populate<Entity extends object, Naked extends FromEntityType<UnboxArray<Entity>> = FromEntityType<UnboxArray<Entity>>, Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(entities: Entity, populate: AutoPath<Naked, Hint, PopulatePath.ALL>[] | false, options?: EntityLoaderOptions<Naked, Fields, Excludes>): Promise<Entity extends object[] ? MergeLoaded<ArrayElement<Entity>, Naked, Hint, Fields, Excludes>[] : MergeLoaded<Entity, Naked, Hint, Fields, Excludes>>;
    /**
     * Returns new EntityManager instance with its own identity map
     */
    fork(options?: ForkOptions): this;
    /**
     * Gets the UnitOfWork used by the EntityManager to coordinate operations.
     */
    getUnitOfWork(useContext?: boolean): UnitOfWork;
    /**
     * Gets the EntityFactory used by the EntityManager.
     */
    getEntityFactory(): EntityFactory;
    /**
     * Gets the Hydrator used by the EntityManager.
     */
    getHydrator(): IHydrator;
    /**
     * Gets the EntityManager based on current transaction/request context.
     * @internal
     */
    getContext(validate?: boolean): this;
    getEventManager(): EventManager;
    /**
     * Checks whether this EntityManager is currently operating inside a database transaction.
     */
    isInTransaction(): boolean;
    /**
     * Gets the transaction context (driver dependent object used to make sure queries are executed on same connection).
     */
    getTransactionContext<T extends Transaction = Transaction>(): T | undefined;
    /**
     * Sets the transaction context.
     */
    setTransactionContext(ctx: Transaction): void;
    /**
     * Resets the transaction context.
     */
    resetTransactionContext(): void;
    /**
     * Gets the `MetadataStorage`.
     */
    getMetadata(): MetadataStorage;
    /**
     * Gets the `EntityMetadata` instance when provided with the `entityName` parameter.
     */
    getMetadata<Entity extends object>(entityName: EntityName<Entity>): EntityMetadata<Entity>;
    /**
     * Gets the EntityComparator.
     */
    getComparator(): EntityComparator;
    private checkLockRequirements;
    private lockAndPopulate;
    private buildFields;
    private preparePopulate;
    /**
     * when the entity is found in identity map, we check if it was partially loaded or we are trying to populate
     * some additional lazy properties, if so, we reload and merge the data from database
     */
    protected shouldRefresh<T extends object, P extends string = never, F extends string = '*', E extends string = never>(meta: EntityMetadata<T>, entity: T, options: FindOneOptions<T, P, F, E>): boolean;
    protected prepareOptions(options: FindOptions<any, any, any, any> | FindOneOptions<any, any, any, any>): void;
    /**
     * @internal
     */
    cacheKey<T extends object>(entityName: string, options: FindOptions<T, any, any, any> | FindOneOptions<T, any, any, any> | CountOptions<T, any>, method: string, where: FilterQuery<T>): unknown[];
    /**
     * @internal
     */
    tryCache<T extends object, R>(entityName: string, config: boolean | number | [string, number] | undefined, key: unknown, refresh?: boolean, merge?: boolean): Promise<{
        data?: R;
        key: string;
    } | undefined>;
    /**
     * @internal
     */
    storeCache(config: boolean | number | [string, number] | undefined, key: {
        key: string;
    }, data: unknown | (() => unknown)): Promise<void>;
    /**
     * Clears result cache for given cache key. If we want to be able to call this method,
     * we need to set the cache key explicitly when storing the cache.
     *
     * ```ts
     * // set the cache key to 'book-cache-key', with expiration of 60s
     * const res = await em.find(Book, { ... }, { cache: ['book-cache-key', 60_000] });
     *
     * // clear the cache key by name
     * await em.clearCache('book-cache-key');
     * ```
     */
    clearCache(cacheKey: string): Promise<void>;
    /**
     * Returns the default schema of this EntityManager. Respects the context, so global EM will give you the contextual schema
     * if executed inside request context handler.
     */
    get schema(): string | undefined;
    /**
     * Sets the default schema of this EntityManager. Respects the context, so global EM will set the contextual schema
     * if executed inside request context handler.
     */
    set schema(schema: string | null | undefined);
    /**
     * Returns the ID of this EntityManager. Respects the context, so global EM will give you the contextual ID
     * if executed inside request context handler.
     */
    get id(): number;
    /** @ignore */
    [inspect.custom](): string;
}
export interface CreateOptions<Convert extends boolean> {
    /** creates a managed entity instance instead, bypassing the constructor call */
    managed?: boolean;
    /** create entity in a specific schema - alternatively, use `wrap(entity).setSchema()` */
    schema?: string;
    /** persist the entity automatically - this is the default behavior and is also configurable globally via `persistOnCreate` option */
    persist?: boolean;
    /** this option disables the strict typing which requires all mandatory properties to have value, it has no effect on runtime */
    partial?: boolean;
    /** convert raw database values based on mapped types (by default, already converted values are expected) */
    convertCustomTypes?: Convert;
}
export interface MergeOptions {
    refresh?: boolean;
    convertCustomTypes?: boolean;
    schema?: string;
}
export interface ForkOptions {
    /** do we want a clear identity map? defaults to true */
    clear?: boolean;
    /** use request context? should be used only for top level request scope EM, defaults to false */
    useContext?: boolean;
    /** do we want to use fresh EventManager instance? defaults to false (global instance) */
    freshEventManager?: boolean;
    /** do we want to clone current EventManager instance? defaults to false (global instance) */
    cloneEventManager?: boolean;
    /** use this flag to ignore the current async context - this is required if we want to call `em.fork()` inside the `getContext` handler */
    disableContextResolution?: boolean;
    /** set flush mode for this fork, overrides the global option can be overridden locally via FindOptions */
    flushMode?: FlushMode;
    /** disable transactions for this fork */
    disableTransactions?: boolean;
    /** should we keep the transaction context of the parent EM? */
    keepTransactionContext?: boolean;
    /** default schema to use for this fork */
    schema?: string;
    /** default logger context, can be overridden via {@apilink FindOptions} */
    loggerContext?: Dictionary;
}
