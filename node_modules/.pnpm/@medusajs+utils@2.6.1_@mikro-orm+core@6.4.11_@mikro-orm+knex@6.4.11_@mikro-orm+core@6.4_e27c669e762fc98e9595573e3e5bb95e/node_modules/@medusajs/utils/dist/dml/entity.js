"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _DmlEntity_tableName, _DmlEntity_cascades, _DmlEntity_indexes, _DmlEntity_checks, _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DmlEntity = void 0;
const common_1 = require("../common");
const build_indexes_1 = require("./helpers/entity-builder/build-indexes");
const belongs_to_1 = require("./relations/belongs-to");
const IsDmlEntity = Symbol.for("isDmlEntity");
function extractNameAndTableName(nameOrConfig) {
    const result = {
        name: "",
        tableName: "",
    };
    if ((0, common_1.isString)(nameOrConfig)) {
        const [schema, ...rest] = nameOrConfig.split(".");
        const name = rest.length ? rest.join(".") : schema;
        result.name = (0, common_1.upperCaseFirst)((0, common_1.toCamelCase)(name));
        result.tableName = nameOrConfig;
    }
    if ((0, common_1.isObject)(nameOrConfig)) {
        if (!nameOrConfig.tableName) {
            throw new Error(`Missing "tableName" property in the config object for "${nameOrConfig.name}" entity`);
        }
        const potentialName = nameOrConfig.name ?? nameOrConfig.tableName;
        const [schema, ...rest] = potentialName.split(".");
        const name = rest.length ? rest.join(".") : schema;
        result.name = (0, common_1.upperCaseFirst)((0, common_1.toCamelCase)(name));
        result.tableName = nameOrConfig.tableName;
    }
    return result;
}
/**
 * Dml entity is a representation of a DML model with a unique
 * name, its schema and relationships.
 */
class DmlEntity {
    constructor(nameOrConfig, schema) {
        this[_a] = true;
        _DmlEntity_tableName.set(this, void 0);
        _DmlEntity_cascades.set(this, {});
        _DmlEntity_indexes.set(this, []);
        _DmlEntity_checks.set(this, []);
        const { name, tableName } = extractNameAndTableName(nameOrConfig);
        this.schema = schema;
        this.name = name;
        __classPrivateFieldSet(this, _DmlEntity_tableName, tableName, "f");
    }
    /**
     * A static method to check if an entity is an instance of DmlEntity.
     * It allows us to identify a specific object as being an instance of
     * DmlEntity.
     *
     * @param entity
     */
    static isDmlEntity(entity) {
        return !!entity?.[IsDmlEntity];
    }
    /**
     * Parse entity to get its underlying information
     */
    parse() {
        return {
            name: this.name,
            tableName: __classPrivateFieldGet(this, _DmlEntity_tableName, "f"),
            schema: this.schema,
            cascades: __classPrivateFieldGet(this, _DmlEntity_cascades, "f"),
            indexes: __classPrivateFieldGet(this, _DmlEntity_indexes, "f"),
            checks: __classPrivateFieldGet(this, _DmlEntity_checks, "f"),
        };
    }
    /**
     * This method configures which related data models an operation, such as deletion,
     * should be cascaded to.
     *
     * For example, if a store is deleted, its product should also be deleted.
     *
     * @param options - The cascades configurations. They object's keys are the names of
     * the actions, such as `deleted`, and the value is an array of relations that the
     * action should be cascaded to.
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const Store = model.define("store", {
     *   id: model.id(),
     *   products: model.hasMany(() => Product),
     * })
     * .cascades({
     *   delete: ["products"],
     * })
     *
     * @customNamespace Model Methods
     */
    cascades(options) {
        const childToParentCascades = options.delete?.filter((relationship) => {
            return belongs_to_1.BelongsTo.isBelongsTo(this.schema[relationship]);
        });
        if (childToParentCascades?.length) {
            throw new Error(`Cannot cascade delete "${childToParentCascades.join(", ")}" relationship(s) from "${this.name}" entity. Child to parent cascades are not allowed`);
        }
        __classPrivateFieldSet(this, _DmlEntity_cascades, options, "f");
        return this;
    }
    /**
     * This method defines indices on the data model. An index can be on multiple columns
     * and have conditions.
     *
     * @param indexes - The index's configuration.
     *
     * @example
     * An example of a simple index:
     *
     * ```ts
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   id: model.id(),
     *   name: model.text(),
     *   age: model.number()
     * }).indexes([
     *   {
     *     on: ["name", "age"],
     *   },
     * ])
     *
     * export default MyCustom
     * ```
     *
     * To add a condition on the index, use the `where` option:
     *
     * ```ts
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   id: model.id(),
     *   name: model.text(),
     *   age: model.number()
     * }).indexes([
     *   {
     *     on: ["name", "age"],
     *     where: {
     *       age: 30
     *     }
     *   },
     * ])
     *
     * export default MyCustom
     * ```
     *
     * The condition can also be a negation. For example:
     *
     * ```ts
     * import { model } from "@medusajs/framework/utils"
     *
     * const MyCustom = model.define("my_custom", {
     *   id: model.id(),
     *   name: model.text(),
     *   age: model.number()
     * }).indexes([
     *   {
     *     on: ["name", "age"],
     *     where: {
     *       age: {
     *         $ne: 30
     *       }
     *     }
     *   },
     * ])
     *
     * export default MyCustom
     * ```
     *
     * In this example, the index is created when the value of `age` doesn't equal `30`.
     *
     * @customNamespace Model Methods
     */
    indexes(indexes) {
        for (const index of indexes) {
            index.where = (0, build_indexes_1.transformIndexWhere)(index);
            index.unique ??= false;
        }
        __classPrivateFieldSet(this, _DmlEntity_indexes, indexes, "f");
        return this;
    }
    checks(checks) {
        __classPrivateFieldSet(this, _DmlEntity_checks, checks, "f");
        return this;
    }
}
exports.DmlEntity = DmlEntity;
_DmlEntity_tableName = new WeakMap(), _DmlEntity_cascades = new WeakMap(), _DmlEntity_indexes = new WeakMap(), _DmlEntity_checks = new WeakMap(), _a = IsDmlEntity;
//# sourceMappingURL=entity.js.map