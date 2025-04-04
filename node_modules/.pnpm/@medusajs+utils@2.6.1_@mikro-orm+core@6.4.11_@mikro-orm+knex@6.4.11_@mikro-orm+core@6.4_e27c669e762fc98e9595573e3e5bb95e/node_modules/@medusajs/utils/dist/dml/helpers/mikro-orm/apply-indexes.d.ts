import { EntityConstructor, EntityIndex, PropertyMetadata } from "@medusajs/types";
/**
 * Creates indexes for a given field
 */
export declare function applyIndexes(MikroORMEntity: EntityConstructor<any>, tableName: string, field: PropertyMetadata): void;
/**
 * Creates indexes for a MikroORM entity
 *
 * Default Indexes:
 *  - Foreign key indexes will be applied to all manyToOne relationships.
 */
export declare function applyEntityIndexes(MikroORMEntity: EntityConstructor<any>, tableName: string, entityIndexes?: EntityIndex[]): void;
//# sourceMappingURL=apply-indexes.d.ts.map