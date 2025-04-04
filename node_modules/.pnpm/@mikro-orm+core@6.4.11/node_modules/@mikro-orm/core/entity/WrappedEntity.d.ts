import type { PopulatePath } from '../enums';
import { inspect } from 'node:util';
import type { EntityManager } from '../EntityManager';
import type { Dictionary, EntityData, EntityDictionary, EntityMetadata, IHydrator, EntityKey, PopulateOptions, Primary, AutoPath, Ref, AddEager, LoadedReference, EntityDTO, Loaded, FromEntityType, IsSubset, MergeSelected } from '../typings';
import { Reference } from './Reference';
import { type AssignOptions } from './EntityAssigner';
import type { EntityLoaderOptions } from './EntityLoader';
import type { EntityIdentifier } from './EntityIdentifier';
import type { SerializationContext } from '../serialization/SerializationContext';
import { type SerializeOptions } from '../serialization/EntitySerializer';
import type { FindOneOptions, LoadHint } from '../drivers/IDatabaseDriver';
export declare class WrappedEntity<Entity extends object> {
    __initialized: boolean;
    __touched: boolean;
    __populated?: boolean;
    __managed?: boolean;
    __onLoadFired?: boolean;
    __schema?: string;
    __em?: EntityManager;
    __loadedProperties: Set<string>;
    __data: Dictionary;
    __processing: boolean;
    __serializationContext: {
        root?: SerializationContext<Entity>;
        populate?: PopulateOptions<Entity>[];
        fields?: Set<string>;
        exclude?: readonly string[];
    };
    /** stores last known primary key, as its current state might be broken due to propagation/orphan removal, but we need to know the PK to be able t remove the entity */
    __pk?: Primary<Entity>;
    /** holds the reference wrapper instance (if created), so we can maintain the identity on reference wrappers too */
    __reference?: Reference<Entity>;
    /** holds last entity data snapshot, so we can compute changes when persisting managed entities */
    __originalEntityData?: EntityData<Entity>;
    /** holds wrapped primary key, so we can compute change set without eager commit */
    __identifier?: EntityIdentifier;
    private readonly entity;
    private readonly hydrator;
    private readonly pkGetter?;
    private readonly pkSerializer?;
    private readonly pkGetterConverted?;
    constructor(entity: Entity, hydrator: IHydrator, pkGetter?: (e: Entity) => Primary<Entity>, pkSerializer?: (e: Entity) => string, pkGetterConverted?: (e: Entity) => Primary<Entity>);
    isInitialized(): boolean;
    isTouched(): boolean;
    isManaged(): boolean;
    populated(populated?: boolean | undefined): void;
    setSerializationContext<Hint extends string = never, Fields extends string = '*', Exclude extends string = never>(options: LoadHint<Entity, Hint, Fields, Exclude>): void;
    toReference(): Ref<Entity> & LoadedReference<Loaded<Entity, AddEager<Entity>>>;
    toObject<Ignored extends EntityKey<Entity> = never>(ignoreFields?: Ignored[]): Omit<EntityDTO<Entity>, Ignored>;
    serialize<Hint extends string = never, Exclude extends string = never>(options?: SerializeOptions<Entity, Hint, Exclude>): EntityDTO<Loaded<Entity, Hint>>;
    toPOJO(): EntityDTO<Entity>;
    toJSON(...args: any[]): EntityDictionary<Entity>;
    assign<Naked extends FromEntityType<Entity> = FromEntityType<Entity>, Convert extends boolean = false, Data extends EntityData<Naked, Convert> | Partial<EntityDTO<Naked>> = EntityData<Naked, Convert> | Partial<EntityDTO<Naked>>>(data: Data & IsSubset<EntityData<Naked>, Data>, options?: AssignOptions<Convert>): MergeSelected<Entity, Naked, keyof Data & string>;
    init<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(options?: FindOneOptions<Entity, Hint, Fields, Excludes>): Promise<Loaded<Entity, Hint, Fields, Excludes> | null>;
    populate<Hint extends string = never>(populate: AutoPath<Entity, Hint, PopulatePath.ALL>[] | false, options?: EntityLoaderOptions<Entity>): Promise<Loaded<Entity, Hint>>;
    hasPrimaryKey(): boolean;
    getPrimaryKey(convertCustomTypes?: boolean): Primary<Entity> | null;
    getPrimaryKeys(convertCustomTypes?: boolean): Primary<Entity>[] | null;
    getSchema(): string | undefined;
    setSchema(schema?: string): void;
    setPrimaryKey(id: Primary<Entity> | null): void;
    getSerializedPrimaryKey(): string;
    get __meta(): EntityMetadata<Entity>;
    get __platform(): import("..").Platform;
    get __config(): import("..").Configuration<import("../drivers/IDatabaseDriver").IDatabaseDriver<import("..").Connection>, EntityManager<import("../drivers/IDatabaseDriver").IDatabaseDriver<import("..").Connection>>>;
    get __primaryKeys(): Primary<Entity>[];
    /** @ignore */
    [inspect.custom](): string;
}
