import { BaseProperty } from "./base";
import { PrimaryKeyModifier } from "./primary-key";
/**
 * The TextProperty is used to define a textual property
 */
export declare class TextProperty extends BaseProperty<string> {
    protected dataType: {
        name: "text";
        options: {
            prefix?: string;
            searchable: boolean;
        };
    };
    /**
     * This method indicates that the property is the data model's primary key.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const Product = model.define("Product", {
     *   code: model.text().primaryKey(),
     *   // ...
     * })
     *
     * export default Product
     *
     * @customNamespace Property Configuration Methods
     */
    primaryKey(): PrimaryKeyModifier<string, TextProperty>;
    /**
     * This method indicates that a text property is searchable.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   name: model.text().searchable(),
     *   // ...
     * })
     *
     * export default MyCustom
     *
     * @customNamespace Property Configuration Methods
     */
    searchable(): this;
}
//# sourceMappingURL=text.d.ts.map