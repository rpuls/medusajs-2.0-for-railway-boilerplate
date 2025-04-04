"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _BaseProperty_indexes, _BaseProperty_relationships, _BaseProperty_defaultValue;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProperty = void 0;
const computed_1 = require("./computed");
const nullable_1 = require("./nullable");
/**
 * The BaseProperty class offers shared affordances to define
 * property classes
 */
class BaseProperty {
    constructor() {
        /**
         * Defined indexes and relationships
         */
        _BaseProperty_indexes.set(this, []);
        _BaseProperty_relationships.set(this, []
        /**
         * Default value for the property
         */
        );
        /**
         * Default value for the property
         */
        _BaseProperty_defaultValue.set(this, void 0);
    }
    /**
     * This method indicates that a property's value can be `null`.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   price: model.bigNumber().nullable(),
     *   // ...
     * })
     *
     * export default MyCustom
     *
     * @customNamespace Property Configuration Methods
     */
    nullable() {
        return new nullable_1.NullableModifier(this);
    }
    /**
     * This method indicated that the property is a computed property.
     * Computed properties are not stored in the database but are
     * computed on the fly.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *  calculated_price: model.bigNumber().computed(),
     *  // ...
     * })
     *
     * export default MyCustom
     *
     * @customNamespace Property Configuration Methods
     */
    computed() {
        return new computed_1.ComputedProperty(this);
    }
    /**
     * This method defines an index on a property.
     *
     * @param {string} name - The index's name. If not provided,
     * Medusa generates the name.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   id: model.id(),
     *   name: model.text().index(
     *     "IDX_MY_CUSTOM_NAME"
     *   ),
     * })
     *
     * export default MyCustom
     *
     * @customNamespace Property Configuration Methods
     */
    index(name) {
        __classPrivateFieldGet(this, _BaseProperty_indexes, "f").push({ name, type: "index" });
        return this;
    }
    /**
     * This method indicates that a property's value must be unique in the database.
     * A unique index is created on the property.
     *
     * @param {string} name - The unique index's name. If not provided,
     * Medusa generates the name.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const User = model.define("user", {
     *   email: model.text().unique(),
     *   // ...
     * })
     *
     * export default User
     *
     * @customNamespace Property Configuration Methods
     */
    unique(name) {
        __classPrivateFieldGet(this, _BaseProperty_indexes, "f").push({ name, type: "unique" });
        return this;
    }
    /**
     * This method defines the default value of a property.
     *
     * @param {T} value - The default value.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   color: model
     *     .enum(["black", "white"])
     *     .default("black"),
     *   age: model
     *     .number()
     *     .default(0),
     *   // ...
     * })
     *
     * export default MyCustom
     *
     * @customNamespace Property Configuration Methods
     */
    default(value) {
        __classPrivateFieldSet(this, _BaseProperty_defaultValue, value, "f");
        return this;
    }
    /**
     * Returns the serialized metadata
     */
    parse(fieldName) {
        return {
            fieldName,
            dataType: this.dataType,
            nullable: false,
            computed: false,
            defaultValue: __classPrivateFieldGet(this, _BaseProperty_defaultValue, "f"),
            indexes: __classPrivateFieldGet(this, _BaseProperty_indexes, "f"),
            relationships: __classPrivateFieldGet(this, _BaseProperty_relationships, "f"),
        };
    }
}
exports.BaseProperty = BaseProperty;
_BaseProperty_indexes = new WeakMap(), _BaseProperty_relationships = new WeakMap(), _BaseProperty_defaultValue = new WeakMap();
//# sourceMappingURL=base.js.map