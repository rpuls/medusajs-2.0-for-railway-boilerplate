import { PropertyType } from "@medusajs/types";
declare const IsPrimaryKeyModifier: unique symbol;
/**
 * PrimaryKey modifier marks a schema node as primaryKey
 */
export declare class PrimaryKeyModifier<T, Schema extends PropertyType<T>> implements PropertyType<T> {
    #private;
    [IsPrimaryKeyModifier]: true;
    static isPrimaryKeyModifier(obj: any): obj is PrimaryKeyModifier<any, any>;
    /**
     * A type-only property to infer the JavScript data-type
     * of the schema property
     */
    $dataType: T;
    constructor(schema: Schema);
    /**
     * Returns the serialized metadata
     */
    parse(fieldName: string): import("@medusajs/types").PropertyMetadata;
}
export {};
//# sourceMappingURL=primary-key.d.ts.map