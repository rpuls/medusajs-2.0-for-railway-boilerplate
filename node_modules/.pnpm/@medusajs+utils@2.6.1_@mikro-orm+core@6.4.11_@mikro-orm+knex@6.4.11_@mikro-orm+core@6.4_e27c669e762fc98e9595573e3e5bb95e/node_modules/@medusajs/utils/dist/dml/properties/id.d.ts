import { BaseProperty } from "./base";
import { PrimaryKeyModifier } from "./primary-key";
declare const IsIdProperty: unique symbol;
/**
 * The Id property defines a unique identifier for the schema.
 * Most of the times it will be the primary as well.
 */
export declare class IdProperty extends BaseProperty<string> {
    [IsIdProperty]: boolean;
    static isIdProperty(value: any): value is IdProperty;
    protected dataType: {
        name: "id";
        options: {
            prefix?: string;
        };
    };
    constructor(options?: {
        prefix?: string;
    });
    /**
     * This method indicates that the property is the data model's primary key.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const Product = model.define("Product", {
     *   id: model.id().primaryKey(),
     *   // ...
     * })
     *
     * export default Product
     *
     * @customNamespace Property Configuration Methods
     */
    primaryKey(): PrimaryKeyModifier<string, IdProperty>;
}
export {};
//# sourceMappingURL=id.d.ts.map