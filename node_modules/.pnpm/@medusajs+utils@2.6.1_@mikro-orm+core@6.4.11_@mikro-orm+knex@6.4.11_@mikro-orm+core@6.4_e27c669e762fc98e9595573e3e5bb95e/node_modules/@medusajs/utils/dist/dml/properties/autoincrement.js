"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoIncrementProperty = void 0;
const base_1 = require("./base");
const primary_key_1 = require("./primary-key");
/**
 * The AutoIncrementProperty is used to define a serial
 * property
 */
class AutoIncrementProperty extends base_1.BaseProperty {
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
    primaryKey() {
        return new primary_key_1.PrimaryKeyModifier(this);
    }
    constructor(options) {
        super();
        this.dataType = {
            name: "serial",
            options: { ...options },
        };
    }
}
exports.AutoIncrementProperty = AutoIncrementProperty;
//# sourceMappingURL=autoincrement.js.map