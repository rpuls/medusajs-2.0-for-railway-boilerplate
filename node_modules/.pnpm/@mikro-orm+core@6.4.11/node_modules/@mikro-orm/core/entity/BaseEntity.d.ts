import { type Ref } from './Reference';
import type { AutoPath, EntityData, EntityDTO, Loaded, LoadedReference, AddEager, EntityKey, FromEntityType, IsSubset, MergeSelected } from '../typings';
import { type AssignOptions } from './EntityAssigner';
import type { EntityLoaderOptions } from './EntityLoader';
import { type SerializeOptions } from '../serialization/EntitySerializer';
import type { FindOneOptions } from '../drivers/IDatabaseDriver';
export declare abstract class BaseEntity {
    isInitialized(): boolean;
    isTouched(): boolean;
    populated(populated?: boolean): void;
    populate<Entity extends this = this, Hint extends string = never>(populate: AutoPath<Entity, Hint>[] | false, options?: EntityLoaderOptions<Entity>): Promise<Loaded<Entity, Hint>>;
    toReference<Entity extends this = this>(): Ref<Entity> & LoadedReference<Loaded<Entity, AddEager<Entity>>>;
    toObject<Entity extends this = this>(): EntityDTO<Entity>;
    toObject<Entity extends this = this>(ignoreFields: never[]): EntityDTO<Entity>;
    toObject<Entity extends this = this, Ignored extends EntityKey<Entity> = never>(ignoreFields: Ignored[]): Omit<EntityDTO<Entity>, Ignored>;
    toPOJO<Entity extends this = this>(): EntityDTO<Entity>;
    serialize<Entity extends this = this, Naked extends FromEntityType<Entity> = FromEntityType<Entity>, Hint extends string = never, Exclude extends string = never>(options?: SerializeOptions<Naked, Hint, Exclude>): EntityDTO<Loaded<Naked, Hint>>;
    assign<Entity extends this, Naked extends FromEntityType<Entity> = FromEntityType<Entity>, Convert extends boolean = false, Data extends EntityData<Naked, Convert> | Partial<EntityDTO<Naked>> = EntityData<Naked, Convert> | Partial<EntityDTO<Naked>>>(data: Data & IsSubset<EntityData<Naked>, Data>, options?: AssignOptions<Convert>): MergeSelected<Entity, Naked, keyof Data & string>;
    init<Entity extends this = this, Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(options?: FindOneOptions<Entity, Hint, Fields, Excludes>): Promise<Loaded<Entity, Hint, Fields, Excludes> | null>;
    getSchema(): string | undefined;
    setSchema(schema?: string): void;
}
