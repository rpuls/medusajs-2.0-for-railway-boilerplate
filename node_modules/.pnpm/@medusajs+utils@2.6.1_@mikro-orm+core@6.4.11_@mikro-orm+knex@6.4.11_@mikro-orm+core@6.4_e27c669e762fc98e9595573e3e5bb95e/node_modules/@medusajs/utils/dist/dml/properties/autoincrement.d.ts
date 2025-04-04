import { BaseProperty } from "./base";
import { PrimaryKeyModifier } from "./primary-key";
/**
 * The AutoIncrementProperty is used to define a serial
 * property
 */
export declare class AutoIncrementProperty extends BaseProperty<number> {
    protected dataType: {
        name: "serial";
        options: {};
    };
    /**
     * This method indicates that the property is the data model's primary key.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const Product = model.define("Product", {
     *   id: model.autoincrement().primaryKey(),
     *   // ...
     * })
     *
     * export default Product
     *
     * @customNamespace Property Configuration Methods
     */
    primaryKey(): PrimaryKeyModifier<number, AutoIncrementProperty>;
    constructor(options?: {
        primaryKey?: boolean;
    });
}
//# sourceMappingURL=autoincrement.d.ts.map