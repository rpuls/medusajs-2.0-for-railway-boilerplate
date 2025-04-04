"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdProperty = void 0;
const base_1 = require("./base");
const primary_key_1 = require("./primary-key");
const IsIdProperty = Symbol("IsIdProperty");
/**
 * The Id property defines a unique identifier for the schema.
 * Most of the times it will be the primary as well.
 */
class IdProperty extends base_1.BaseProperty {
    static isIdProperty(value) {
        return !!value?.[IsIdProperty] || value?.dataType?.name === "id";
    }
    constructor(options) {
        super();
        this[_a] = true;
        this.dataType = {
            name: "id",
            options: {},
        };
        this.dataType.options.prefix = options?.prefix;
    }
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
    primaryKey() {
        return new primary_key_1.PrimaryKeyModifier(this);
    }
}
exports.IdProperty = IdProperty;
_a = IsIdProperty;
//# sourceMappingURL=id.js.map