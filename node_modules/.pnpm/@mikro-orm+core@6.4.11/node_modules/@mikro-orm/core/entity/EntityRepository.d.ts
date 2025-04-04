import type { PopulatePath } from '../enums';
import type { CreateOptions, EntityManager, MergeOptions } from '../EntityManager';
import type { AssignOptions } from './EntityAssigner';
import type { EntityData, EntityName, Primary, Loaded, FilterQuery, EntityDictionary, AutoPath, RequiredEntityData, Ref, EntityType, EntityDTO, MergeSelected, FromEntityType, IsSubset, MergeLoaded, ArrayElement } from '../typings';
import type { CountOptions, DeleteOptions, FindAllOptions, FindByCursorOptions, FindOneOptions, FindOneOrFailOptions, FindOptions, GetReferenceOptions, NativeInsertUpdateOptions, UpdateOptions, UpsertManyOptions, UpsertOptions } from '../drivers/IDatabaseDriver';
import type { EntityLoaderOptions } from './EntityLoader';
import type { Cursor } from '../utils/Cursor';
export declare class EntityRepository<Entity extends object> {
    protected readonly em: EntityManager;
    protected readonly entityName: EntityName<Entity>;
    constructor(em: EntityManager, entityName: EntityName<Entity>);
    /**
     * Finds first entity matching your `where` query.
     */
    findOne<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(where: FilterQuery<Entity>, options?: FindOneOptions<Entity, Hint, Fields, Excludes>): Promise<Loaded<Entity, Hint, Fields, Excludes> | null>;
    /**
     * Finds first entity matching your `where` query. If nothing is found, it will throw an error.
     * You can override the factory for creating this method via `options.failHandler` locally
     * or via `Configuration.findOneOrFailHandler` globally.
     */
    findOneOrFail<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(where: FilterQuery<Entity>, options?: FindOneOrFailOptions<Entity, Hint, Fields, Excludes>): Promise<Loaded<Entity, Hint, Fields, Excludes>>;
    /**
     * Creates or updates the entity, based on whether it is already present in the database.
     * This method performs an `insert on conflict merge` query ensuring the database is in sync, returning a managed
     * entity instance. The method accepts either `entityName` together with the entity `data`, or just entity instance.
     *
     * ```ts
     * // insert into "author" ("age", "email") values (33, 'foo@bar.com') on conflict ("email") do update set "age" = 41
     * const author = await em.getRepository(Author).upsert({ email: 'foo@bar.com', age: 33 });
     * ```
     *
     * The entity data needs to contain either the primary key, or any other unique property. Let's consider the following example, where `Author.email` is a unique property:
     *
     * ```ts
     * // insert into "author" ("age", "email") values (33, 'foo@bar.com') on conflict ("email") do update set "age" = 41
     * // select "id" from "author" where "email" = 'foo@bar.com'
     * const author = await em.getRepository(Author).upsert({ email: 'foo@bar.com', age: 33 });
     * ```
     *
     * Depending on the driver support, this will either use a returning query, or a separate select query, to fetch the primary key if it's missing from the `data`.
     *
     * If the entity is already present in current context, there won't be any queries - instead, the entity data will be assigned and an explicit `flush` will be required for those changes to be persisted.
     */
    upsert<Fields extends string = any>(entityOrData?: EntityData<Entity> | Entity, options?: UpsertOptions<Entity, Fields>): Promise<Entity>;
    /**
     * Creates or updates the entity, based on whether it is already present in the database.
     * This method performs an `insert on conflict merge` query ensuring the database is in sync, returning a managed
     * entity instance.
     *
     * ```ts
     * // insert into "author" ("age", "email") values (33, 'foo@bar.com') on conflict ("email") do update set "age" = 41
     * const authors = await em.getRepository(Author).upsertMany([{ email: 'foo@bar.com', age: 33 }, ...]);
     * ```
     *
     * The entity data needs to contain either the primary key, or any other unique property. Let's consider the following example, where `Author.email` is a unique property:
     *
     * ```ts
     * // insert into "author" ("age", "email") values (33, 'foo@bar.com'), (666, 'lol@lol.lol') on conflict ("email") do update set "age" = excluded."age"
     * // select "id" from "author" where "email" = 'foo@bar.com'
     * const author = await em.getRepository(Author).upsertMany([
     *   { email: 'foo@bar.com', age: 33 },
     *   { email: 'lol@lol.lol', age: 666 },
     * ]);
     * ```
     *
     * Depending on the driver support, this will either use a returning query, or a separate select query, to fetch the primary key if it's missing from the `data`.
     *
     * If the entity is already present in current context, there won't be any queries - instead, the entity data will be assigned and an explicit `flush` will be required for those changes to be persisted.
     */
    upsertMany<Fields extends string = any>(entitiesOrData?: EntityData<Entity>[] | Entity[], options?: UpsertManyOptions<Entity, Fields>): Promise<Entity[]>;
    /**
     * Finds all entities matching your `where` query. You can pass additional options via the `options` parameter.
     */
    find<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(where: FilterQuery<Entity>, options?: FindOptions<Entity, Hint, Fields, Excludes>): Promise<Loaded<Entity, Hint, Fields, Excludes>[]>;
    /**
     * Calls `em.find()` and `em.count()` with the same arguments (where applicable) and returns the results as tuple
     * where first element is the array of entities, and the second is the count.
     */
    findAndCount<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(where: FilterQuery<Entity>, options?: FindOptions<Entity, Hint, Fields, Excludes>): Promise<[Loaded<Entity, Hint, Fields, Excludes>[], number]>;
    /**
     * @inheritDoc EntityManager.findByCursor
     */
    findByCursor<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(where: FilterQuery<Entity>, options: FindByCursorOptions<Entity, Hint, Fields, Excludes>): Promise<Cursor<Entity, Hint, Fields, Excludes>>;
    /**
     * Finds all entities of given type. You can pass additional options via the `options` parameter.
     */
    findAll<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(options?: FindAllOptions<Entity, Hint, Fields, Excludes>): Promise<Loaded<Entity, Hint, Fields, Excludes>[]>;
    /**
     * @inheritDoc EntityManager.insert
     */
    insert(data: Entity | RequiredEntityData<Entity>, options?: NativeInsertUpdateOptions<Entity>): Promise<Primary<Entity>>;
    /**
     * @inheritDoc EntityManager.insert
     */
    insertMany(data: Entity[] | RequiredEntityData<Entity>[], options?: NativeInsertUpdateOptions<Entity>): Promise<Primary<Entity>[]>;
    /**
     * Fires native update query. Calling this has no side effects on the context (identity map).
     */
    nativeUpdate(where: FilterQuery<Entity>, data: EntityData<Entity>, options?: UpdateOptions<Entity>): Promise<number>;
    /**
     * Fires native delete query. Calling this has no side effects on the context (identity map).
     */
    nativeDelete(where: FilterQuery<Entity>, options?: DeleteOptions<Entity>): Promise<number>;
    /**
     * Maps raw database result to an entity and merges it to this EntityManager.
     */
    map(result: EntityDictionary<Entity>, options?: {
        schema?: string;
    }): Entity;
    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference(id: Primary<Entity>, options: Omit<GetReferenceOptions, 'wrapped'> & {
        wrapped: true;
    }): Ref<Entity>;
    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference(id: Primary<Entity> | Primary<Entity>[]): Entity;
    /**
     * Gets a reference to the entity identified by the given type and identifier without actually loading it, if the entity is not yet loaded
     */
    getReference(id: Primary<Entity>, options: Omit<GetReferenceOptions, 'wrapped'> & {
        wrapped: false;
    }): Entity;
    /**
     * Checks whether given property can be populated on the entity.
     */
    canPopulate(property: string): boolean;
    /**
     * Loads specified relations in batch. This will execute one query for each relation, that will populate it on all the specified entities.
     */
    populate<Ent extends Entity | Entity[], Hint extends string = never, Naked extends FromEntityType<Entity> = FromEntityType<Entity>, Fields extends string = '*', Excludes extends string = never>(entities: Ent, populate: AutoPath<Naked, Hint, PopulatePath.ALL>[] | false, options?: EntityLoaderOptions<Naked, Fields, Excludes>): Promise<Ent extends object[] ? MergeLoaded<ArrayElement<Ent>, Naked, Hint, Fields, Excludes>[] : MergeLoaded<Ent, Naked, Hint, Fields, Excludes>>;
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
    create<Convert extends boolean = false>(data: RequiredEntityData<Entity, never, Convert>, options?: CreateOptions<Convert>): Entity;
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
    create<Convert extends boolean = false>(data: EntityData<Entity, Convert>, options: CreateOptions<Convert> & {
        partial: true;
    }): Entity;
    /**
     * Shortcut for `wrap(entity).assign(data, { em })`
     */
    assign<Ent extends EntityType<Entity>, Naked extends FromEntityType<Ent> = FromEntityType<Ent>, Convert extends boolean = false, Data extends EntityData<Naked, Convert> | Partial<EntityDTO<Naked>> = EntityData<Naked, Convert> | Partial<EntityDTO<Naked>>>(entity: Ent | Partial<Ent>, data: Data & IsSubset<EntityData<Naked, Convert>, Data>, options?: AssignOptions<Convert>): MergeSelected<Ent, Naked, keyof Data & string>;
    /**
     * Merges given entity to this EntityManager so it becomes managed. You can force refreshing of existing entities
     * via second parameter. By default it will return already loaded entities without modifying them.
     */
    merge(data: Entity | EntityData<Entity>, options?: MergeOptions): Entity;
    /**
     * Returns total number of entities matching your `where` query.
     */
    count<Hint extends string = never>(where?: FilterQuery<Entity>, options?: CountOptions<Entity, Hint>): Promise<number>;
    getEntityName(): string;
    /**
     * Returns the underlying EntityManager instance
     */
    getEntityManager(): EntityManager;
    protected validateRepositoryType(entities: Entity[] | Entity, method: string): void;
}
