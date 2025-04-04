"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _EntityBuilder_instances, _EntityBuilder_disallowImplicitProperties;
Object.defineProperty(exports, "__esModule", { value: true });
exports.model = exports.EntityBuilder = void 0;
const entity_1 = require("./entity");
const create_big_number_properties_1 = require("./helpers/entity-builder/create-big-number-properties");
const create_default_properties_1 = require("./helpers/entity-builder/create-default-properties");
const properties_1 = require("./properties");
const array_1 = require("./properties/array");
const autoincrement_1 = require("./properties/autoincrement");
const big_number_1 = require("./properties/big-number");
const boolean_1 = require("./properties/boolean");
const date_time_1 = require("./properties/date-time");
const enum_1 = require("./properties/enum");
const id_1 = require("./properties/id");
const json_1 = require("./properties/json");
const number_1 = require("./properties/number");
const text_1 = require("./properties/text");
const belongs_to_1 = require("./relations/belongs-to");
const has_many_1 = require("./relations/has-many");
const has_one_1 = require("./relations/has-one");
const has_one_fk_1 = require("./relations/has-one-fk");
const many_to_many_1 = require("./relations/many-to-many");
/**
 * The implicit properties added by EntityBuilder in every schema
 */
const IMPLICIT_PROPERTIES = ["created_at", "updated_at", "deleted_at"];
/**
 * Entity builder exposes the API to create an entity and define its
 * schema using the shorthand methods.
 */
class EntityBuilder {
    constructor() {
        _EntityBuilder_instances.add(this);
    }
    /**
     * This method defines a data model.
     *
     * @typeParam Schema - The type of the accepted schema in the second parameter of the method.
     *
     * @param {DefineOptions} nameOrConfig - Either the data model's name, or configurations to name the data model.
     * The data model's name must be unique.
     * @param {Schema} schema - The schema of the data model's properties.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   id: model.id(),
     *   name: model.text(),
     * })
     *
     * export default MyCustom
     */
    define(nameOrConfig, schema) {
        __classPrivateFieldGet(this, _EntityBuilder_instances, "m", _EntityBuilder_disallowImplicitProperties).call(this, schema);
        return new entity_1.DmlEntity(nameOrConfig, {
            ...schema,
            ...(0, create_big_number_properties_1.createBigNumberProperties)(schema),
            ...(0, create_default_properties_1.createDefaultProperties)(),
        });
    }
    /**
     * This method defines an automatically generated string ID property.
     *
     * You must use the "primaryKey" modifier to mark the property as the
     * primary key.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const User = model.define("User", {
     *   id: model.id().primaryKey(),
     *   // ...
     * })
     *
     * export default User
     *
     * @customNamespace Property Types
     */
    id(options) {
        return new id_1.IdProperty(options);
    }
    /**
     * This method defines a string property.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   name: model.text(),
     *   // ...
     * })
     *
     * export default MyCustom
     *
     * @customNamespace Property Types
     */
    text() {
        return new text_1.TextProperty();
    }
    /**
     * This method defines a boolean property.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   hasAccount: model.boolean(),
     *   // ...
     * })
     *
     * export default MyCustom
     *
     * @customNamespace Property Types
     */
    boolean() {
        return new boolean_1.BooleanProperty();
    }
    /**
     * This method defines a number property.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   age: model.number(),
     *   // ...
     * })
     *
     * export default MyCustom
     *
     * @customNamespace Property Types
     */
    number() {
        return new number_1.NumberProperty();
    }
    /**
     * This method defines a number property that expects large numbers, such as prices.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   price: model.bigNumber(),
     *   // ...
     * })
     *
     * export default MyCustom
     *
     * @customNamespace Property Types
     *
     * @privateRemarks
     * This property produces an additional
     * column - raw_{{ property_name }}, which stores the configuration
     * of bignumber (https://github.com/MikeMcl/bignumber.js)
     */
    bigNumber() {
        return new big_number_1.BigNumberProperty();
    }
    /**
     * This method defines a float property that allows for
     * values with decimal places
     *
     * @version 2.1.2
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("tax", {
     *   tax_rate: model.float(),
     *   // ...
     * })
     *
     * export default MyCustom
     *
     * @customNamespace Property Types
     */
    float() {
        return new properties_1.FloatProperty();
    }
    /**
     * This method defines an autoincrement property.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   serial_id: model.autoincrement(),
     *   // ...
     * })
     *
     * export default MyCustom
     *
     * @customNamespace Property
     */
    autoincrement() {
        return new autoincrement_1.AutoIncrementProperty();
    }
    /**
     * This method defines an array of strings property.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   names: model.array(),
     *   // ...
     * })
     *
     * export default MyCustom
     *
     * @customNamespace Property Types
     */
    array() {
        return new array_1.ArrayProperty();
    }
    /**
     * This method defines a timestamp property.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   date_of_birth: model.dateTime(),
     *   // ...
     * })
     *
     * export default MyCustom
     *
     * @customNamespace Property Types
     */
    dateTime() {
        return new date_time_1.DateTimeProperty();
    }
    /**
     * This method defines a property whose value is a stringified JSON object.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   metadata: model.json(),
     *   // ...
     * })
     *
     * export default MyCustom
     *
     * @customNamespace Property Types
     */
    json() {
        return new json_1.JSONProperty();
    }
    /**
     * This method defines a property whose value can only be one of the specified values.
     *
     * @typeParam Values - The type of possible values. By default, it's `string`.
     *
     * @param {Values[]} values - An array of possible values.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   color: model.enum(["black", "white"]),
     *   // ...
     * })
     *
     * export default MyCustom
     *
     * @customNamespace Property Types
     */
    enum(values) {
        return new enum_1.EnumProperty(values);
    }
    hasOne(entityBuilder, options) {
        if (options?.foreignKey) {
            return new has_one_fk_1.HasOneWithForeignKey(entityBuilder, options || {});
        }
        return new has_one_1.HasOne(entityBuilder, options || {});
    }
    /**
     * This method defines the inverse of the {@link hasOne} or {@link hasMany} relationship.
     *
     * For example, a product "belongsTo" a store.
     *
     * @typeParam T - The type of the entity builder passed as a first parameter. By default, it's
     * a function returning the related model.
     *
     * @param {T} entityBuilder - A function that returns the data model this model is related to.
     * @param {RelationshipOptions} options - The relationship's options.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const Product = model.define("product", {
     *   id: model.id(),
     *   store: model.belongsTo(() => Store, {
     *     mappedBy: "products",
     *   }),
     * })
     *
     * @customNamespace Relationship Methods
     */
    belongsTo(entityBuilder, options) {
        return new belongs_to_1.BelongsTo(entityBuilder, options || {});
    }
    /**
     * This method defines a relationship between two data models,
     * where the owner of the relationship has many records of the related
     * data model, but the related data model only has one owner.
     *
     * For example, a store "hasMany" products.
     *
     * @typeParam T - The type of the entity builder passed as a first parameter. By default, it's
     * a function returning the related model.
     *
     * @param {T} entityBuilder - A function that returns the data model this model is related to.
     * @param {RelationshipOptions} options - The relationship's options.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const Store = model.define("store", {
     *   id: model.id(),
     *   products: model.hasMany(() => Product),
     * })
     *
     * @customNamespace Relationship Methods
     */
    hasMany(entityBuilder, options) {
        return new has_many_1.HasMany(entityBuilder, options || {});
    }
    /**
     * This method defines a relationship between two data models,
     * where both data models have many related records.
     *
     * For example, an order is associated with many products, and a product
     * is associated with many orders.
     *
     * @typeParam T - The type of the entity builder passed as a first parameter. By default, it's
     * a function returning the related model.
     *
     * @param {T} entityBuilder - A function that returns the data model this model is related to.
     * @param {RelationshipOptions} options - The relationship's options.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const Order = model.define("order", {
     *   id: model.id(),
     *   products: model.manyToMany(() => Product),
     * })
     *
     * const Product = model.define("product", {
     *   id: model.id(),
     *   order: model.manyToMany(() => Order),
     * })
     *
     * @customNamespace Relationship Methods
     */
    manyToMany(entityBuilder, options) {
        return new many_to_many_1.ManyToMany(entityBuilder, options || {});
    }
}
exports.EntityBuilder = EntityBuilder;
_EntityBuilder_instances = new WeakSet(), _EntityBuilder_disallowImplicitProperties = function _EntityBuilder_disallowImplicitProperties(schema) {
    const implicitProperties = Object.keys(schema).filter((fieldName) => IMPLICIT_PROPERTIES.includes(fieldName));
    if (implicitProperties.length) {
        throw new Error(`Cannot define field(s) "${implicitProperties.join(",")}" as they are implicitly defined on every model`);
    }
};
exports.model = new EntityBuilder();
//# sourceMappingURL=entity-builder.js.map