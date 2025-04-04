import { RelationshipType } from "@medusajs/types";
import { IsRelationship } from "./base";
declare const IsNullableModifier: unique symbol;
/**
 * Nullable modifier marks a schema node as nullable
 */
export declare class RelationNullableModifier<T, Relation extends RelationshipType<T>, ForeignKey extends boolean> implements RelationshipType<T | null> {
    #private;
    [IsNullableModifier]: true;
    [IsRelationship]: true;
    static isNullableModifier<T>(modifier: any): modifier is RelationNullableModifier<T, any, any>;
    type: Relation["type"];
    /**
     * A type-only property to infer the JavScript data-type
     * of the schema property
     */
    $dataType: T | null;
    $foreignKey: ForeignKey;
    constructor(relation: Relation);
    /**
     * Returns the serialized metadata
     */
    parse(fieldName: string): import("@medusajs/types").RelationshipMetadata;
}
export {};
//# sourceMappingURL=nullable.d.ts.map