import { EntityConstructor, PropertyType } from "@medusajs/types";
/**
 * Defines a DML entity schema field as a Mikro ORM property
 */
export declare function defineProperty(MikroORMEntity: EntityConstructor<any>, property: PropertyType<any>, { tableName, propertyName }: {
    tableName: string;
    propertyName: string;
}): void;
//# sourceMappingURL=define-property.d.ts.map