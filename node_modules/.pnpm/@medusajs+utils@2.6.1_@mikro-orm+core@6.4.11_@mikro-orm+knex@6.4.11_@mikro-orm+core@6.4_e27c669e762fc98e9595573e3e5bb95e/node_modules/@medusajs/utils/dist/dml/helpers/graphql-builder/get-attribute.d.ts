import { PropertyType } from "@medusajs/types";
/**
 * Defines a DML entity schema field as a Mikro ORM property
 */
export declare function getGraphQLAttributeFromDMLPropety(modelName: string, propertyName: string, property: PropertyType<any>): {
    enum?: string;
    attribute: string;
};
//# sourceMappingURL=get-attribute.d.ts.map