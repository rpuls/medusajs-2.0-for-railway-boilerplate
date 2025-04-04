import { RelationshipMetadata, RelationshipOptions, RelationshipType, RelationshipTypes } from "@medusajs/types";
export declare const IsRelationship: unique symbol;
/**
 * The BaseRelationship encapsulates the repetitive parts of defining
 * a relationship
 */
export declare abstract class BaseRelationship<T> implements RelationshipType<T> {
    #private;
    [IsRelationship]: true;
    /**
     * Configuration options for the relationship
     */
    protected options: RelationshipOptions;
    /**
     * Relationship type
     */
    abstract type: RelationshipTypes;
    /**
     * A type-only property to infer the JavScript data-type
     * of the relationship property
     */
    $dataType: T;
    static isRelationship<T>(relationship: any): relationship is BaseRelationship<T>;
    constructor(referencedEntity: T, options: RelationshipOptions);
    /**
     * This method indicates that the relationship is searchable
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const Product = model.define("Product", {
     *   variants: model.hasMany(() => ProductVariant).searchable(),
     *   // ...
     * })
     *
     * export default Product
     */
    searchable(): this;
    /**
     * Returns the parsed copy of the relationship
     */
    parse(relationshipName: string): RelationshipMetadata;
}
//# sourceMappingURL=base.d.ts.map