import type { ArrayElement, AutoPath, CleanTypeConfig, EntityDTO, FromEntityType, Loaded, TypeConfig, UnboxArray } from '../typings';
import { type PopulatePath } from '../enums';
export declare class EntitySerializer {
    static serialize<T extends object, P extends string = never, E extends string = never>(entity: T, options?: SerializeOptions<T, P, E>): EntityDTO<Loaded<T, P>>;
    private static propertyName;
    private static processProperty;
    private static extractChildOptions;
    private static processEntity;
    private static processCollection;
}
export interface SerializeOptions<T, P extends string = never, E extends string = never> {
    /** Specify which relation should be serialized as populated and which as a FK. */
    populate?: readonly AutoPath<T, P, `${PopulatePath.ALL}`>[];
    /** Specify which properties should be omitted. */
    exclude?: readonly AutoPath<T, E>[];
    /** Enforce unpopulated references to be returned as objects, e.g. `{ author: { id: 1 } }` instead of `{ author: 1 }`. */
    forceObject?: boolean;
    /** Ignore custom property serializers. */
    ignoreSerializers?: boolean;
    /** Skip properties with `null` value. */
    skipNull?: boolean;
    /** Only include properties for a specific group. If a property does not specify any group, it will be included, otherwise only properties with a matching group are included. */
    groups?: string[];
}
/**
 * Converts entity instance to POJO, converting the `Collection`s to arrays and unwrapping the `Reference` wrapper, while respecting the serialization options.
 * This method accepts either a single entity or an array of entities, and returns the corresponding POJO or an array of POJO.
 * To serialize a single entity, you can also use `wrap(entity).serialize()` which handles a single entity only.
 *
 * ```ts
 * const dtos = serialize([user1, user, ...], { exclude: ['id', 'email'], forceObject: true });
 * const [dto2, dto3] = serialize([user2, user3], { exclude: ['id', 'email'], forceObject: true });
 * const dto1 = serialize(user, { exclude: ['id', 'email'], forceObject: true });
 * const dto2 = wrap(user).serialize({ exclude: ['id', 'email'], forceObject: true });
 * ```
 */
export declare function serialize<Entity extends object, Naked extends FromEntityType<Entity> = FromEntityType<Entity>, Populate extends string = never, Exclude extends string = never, Config extends TypeConfig = never>(entity: Entity, options?: Config & SerializeOptions<UnboxArray<Entity>, Populate, Exclude>): Naked extends object[] ? EntityDTO<Loaded<ArrayElement<Naked>, Populate>, CleanTypeConfig<Config>>[] : EntityDTO<Loaded<Naked, Populate>, CleanTypeConfig<Config>>;
