import type { EntityDTO, EntityKey } from '../typings';
export declare class EntityTransformer {
    static toObject<Entity extends object, Ignored extends EntityKey<Entity> = never>(entity: Entity, ignoreFields?: Ignored[], raw?: boolean): Omit<EntityDTO<Entity>, Ignored>;
    private static propertyName;
    private static processProperty;
    private static processEntity;
    private static processCollection;
}
