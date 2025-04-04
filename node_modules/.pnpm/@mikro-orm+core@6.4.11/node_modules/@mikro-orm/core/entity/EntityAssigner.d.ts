import type { EntityManager } from '../EntityManager';
import type { EntityData, EntityDTO, EntityProperty, FromEntityType, IsSubset, MergeSelected } from '../typings';
export declare class EntityAssigner {
    static assign<Entity extends object, Naked extends FromEntityType<Entity> = FromEntityType<Entity>, Convert extends boolean = false, Data extends EntityData<Naked, Convert> | Partial<EntityDTO<Naked>> = EntityData<Naked, Convert> | Partial<EntityDTO<Naked>>>(entity: Entity, data: Data & IsSubset<EntityData<Naked, Convert>, Data>, options?: AssignOptions<Convert>): MergeSelected<Entity, Naked, keyof Data & string>;
    private static assignProperty;
    /**
     * auto-wire 1:1 inverse side with owner as in no-sql drivers it can't be joined
     * also makes sure the link is bidirectional when creating new entities from nested structures
     * @internal
     */
    static autoWireOneToOne<T extends object, O extends object>(prop: EntityProperty<O, T>, entity: O): void;
    private static validateEM;
    private static assignReference;
    private static assignCollection;
    private static assignEmbeddable;
    private static createCollectionItem;
}
export declare const assign: typeof EntityAssigner.assign;
export interface AssignOptions<Convert extends boolean> {
    /**
     * Allows disabling processing of nested relations. When disabled, an object payload in place of a relation always
     * results in an `INSERT` query. To assign a value of the relation, use the foreign key instead of an object.
     * Defaults to `true`.
     */
    updateNestedEntities?: boolean;
    /**
     * When assigning to a relation property with object payload and `updateNestedEntities` enabled (default), you can
     * control how a payload without a primary key is handled. By default, it is considered as a new object, resulting
     * in an `INSERT` query. Use `updateByPrimaryKey: false` to allow assigning the data on an existing relation instead.
     * Defaults to `true`.
     */
    updateByPrimaryKey?: boolean;
    /**
     * When you have some properties in the payload that are not represented by an entity property mapping, you can skip
     * such unknown properties via `onlyProperties: true`. Defaults to `false`.
     */
    onlyProperties?: boolean;
    /**
     * With `onlyOwnProperties` enabled, to-many relations are skipped, and payloads of to-one relations are converted
     * to foreign keys. Defaults to `false`.
     */
    onlyOwnProperties?: boolean;
    /**
     * With `ignoreUndefined` enabled, `undefined` properties passed in the payload are skipped. Defaults to `false`.
     */
    ignoreUndefined?: boolean;
    /**
     * `assign` excepts runtime values for properties using custom types. To be able to assign raw database values, you
     * can enable the `convertCustomTypes` option. Defaults to `false`.
     */
    convertCustomTypes?: Convert;
    /**
     * When assigning to a JSON property, the value is replaced. Use `mergeObjectProperties: true` to enable deep merging
     * of the payload with the existing value. Defaults to `false`.
     */
    mergeObjectProperties?: boolean;
    /**
     * When assigning to an embedded property, the values are deeply merged with the existing data.
     * Use `mergeEmbeddedProperties: false` to replace them instead. Defaults to `true`.
     */
    mergeEmbeddedProperties?: boolean;
    /**
     * When assigning to a relation property, if the value is a POJO and `updateByPrimaryKey` is enabled, we check if
     * the target exists in the identity map based on its primary key and call `assign` on it recursively. If there is
     * no primary key provided, or the entity is not present in the context, such an entity is considered as new
     * (resulting in `INSERT` query), created via `em.create()`. You can use `merge: true` to use `em.merge()` instead,
     * which means there won't be any query used for persisting the relation. Defaults to `false`.
     */
    merge?: boolean;
    /**
     * When assigning to a to-many relation properties (`Collection`) with `updateNestedEntities` and `updateByPrimaryKey`
     * enabled (default), you can use this option to override the relation schema. This is used only when trying to find
     * the entity reference in the current context. If it is not found, we create the relation entity using the target
     * entity schema. The value is automatically inferred from the target entity.
     */
    schema?: string;
    /**
     * When using the static `assign()` helper, you can pass the EntityManager instance explicitly via the `em` option.
     * This is only needed when you try to assign a relation property. The value is automatically inferred from the target
     * entity when it is managed, or when you use `em.assign()` instead.
     */
    em?: EntityManager;
}
