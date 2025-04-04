import { PropertyType } from "@medusajs/types";
declare const IsComputedProperty: unique symbol;
/**
 * Computed property marks a schema node as computed
 */
export declare class ComputedProperty<T, Schema extends PropertyType<T>> implements PropertyType<T | null> {
    #private;
    [IsComputedProperty]: true;
    static isComputedProperty(obj: any): obj is ComputedProperty<any, any>;
    /**
     * A type-only property to infer the JavScript data-type
     * of the schema property
     */
    $dataType: T | null;
    constructor(schema: Schema);
    /**
     * Returns the serialized metadata
     */
    parse(fieldName: string): import("@medusajs/types").PropertyMetadata;
}
export {};
//# sourceMappingURL=computed.d.ts.map