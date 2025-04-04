"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberProperty = void 0;
const base_1 = require("./base");
const primary_key_1 = require("./primary-key");
/**
 * The NumberProperty is used to define a numeric/integer
 * property
 */
class NumberProperty extends base_1.BaseProperty {
    /**
     * This method indicates that the property is the data model's primary key.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const Product = model.define("Product", {
     *   code: model.number().primaryKey(),
     *   // ...
     * })
     *
     * export default Product
     *
     * @customNamespace Property Configuration Methods
     */
    primaryKey() {
        return new primary_key_1.PrimaryKeyModifier(this);
    }
    /**
     * This method indicates that a number property is searchable.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   name: model.number().searchable(),
     *   // ...
     * })
     *
     * export default MyCustom
     *
     * @customNamespace Property Configuration Methods
     */
    searchable() {
        this.dataType.options.searchable = true;
        return this;
    }
    constructor(options) {
        super();
        this.dataType = {
            name: "number",
            options: { ...options },
        };
    }
}
exports.NumberProperty = NumberProperty;
//# sourceMappingURL=number.js.map