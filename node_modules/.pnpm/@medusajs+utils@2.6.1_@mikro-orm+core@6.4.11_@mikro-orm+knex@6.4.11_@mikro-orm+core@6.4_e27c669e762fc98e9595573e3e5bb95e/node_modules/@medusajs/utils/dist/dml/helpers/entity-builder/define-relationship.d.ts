import { EntityCascades, EntityConstructor, PropertyType, RelationshipMetadata, RelationshipType } from "@medusajs/types";
import { DmlEntity } from "../../entity";
type Context = {
    MANY_TO_MANY_TRACKED_RELATIONS: Record<string, boolean>;
};
/**
 * Defines has one relationship on the Mikro ORM entity.
 */
export declare function defineHasOneRelationship(MikroORMEntity: EntityConstructor<any>, relationship: RelationshipMetadata, relatedEntity: DmlEntity<Record<string, PropertyType<any> | RelationshipType<any>>, any>, { relatedModelName }: {
    relatedModelName: string;
}, cascades: EntityCascades<string[], string[]>): void;
/**
 * Defines has one relationship with Foreign key on the MikroORM
 * entity
 */
export declare function defineHasOneWithFKRelationship(MikroORMEntity: EntityConstructor<any>, entity: DmlEntity<any, any>, relationship: RelationshipMetadata, { relatedModelName }: {
    relatedModelName: string;
}, cascades: EntityCascades<string[], string[]>): void;
/**
 * Defines has many relationship on the Mikro ORM entity
 */
export declare function defineHasManyRelationship(MikroORMEntity: EntityConstructor<any>, relationship: RelationshipMetadata, { relatedModelName }: {
    relatedModelName: string;
}, cascades: EntityCascades<string[], string[]>): void;
/**
 * Defines belongs to relationship on the Mikro ORM entity. The belongsTo
 * relationship inspects the related entity for the other side of
 * the relationship and then uses one of the following Mikro ORM
 * relationship.
 *
 * - OneToOne: When the other side uses "hasOne" with "owner: true"
 * - ManyToOne: When the other side uses "hasMany"
 */
export declare function defineBelongsToRelationship(MikroORMEntity: EntityConstructor<any>, entity: DmlEntity<any, any>, relationship: RelationshipMetadata, relatedEntity: DmlEntity<Record<string, PropertyType<any> | RelationshipType<any>>, any>, { relatedModelName }: {
    relatedModelName: string;
}): void;
/**
 * Defines a many to many relationship on the Mikro ORM entity
 */
export declare function defineManyToManyRelationship(MikroORMEntity: EntityConstructor<any>, entity: DmlEntity<any, any>, relationship: RelationshipMetadata, relatedEntity: DmlEntity<Record<string, PropertyType<any> | RelationshipType<any>>, any>, { relatedModelName, pgSchema, }: {
    relatedModelName: string;
    pgSchema: string | undefined;
}, { MANY_TO_MANY_TRACKED_RELATIONS }: Context): void;
/**
 * Defines a DML entity schema field as a Mikro ORM relationship
 */
export declare function defineRelationship(MikroORMEntity: EntityConstructor<any>, entity: DmlEntity<any, any>, relationship: RelationshipMetadata, cascades: EntityCascades<string[], string[]>, context: Context): void;
export {};
//# sourceMappingURL=define-relationship.d.ts.map