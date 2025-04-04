import { CheckConstraint, DMLSchema, EntityCascades, EntityIndex, ExtractEntityRelations, IDmlEntity, IDmlEntityConfig, InferDmlEntityNameFromConfig, QueryCondition } from "@medusajs/types";
import { DMLSchemaWithBigNumber } from "./helpers/entity-builder/create-big-number-properties";
import { DMLSchemaDefaults } from "./helpers/entity-builder/create-default-properties";
declare const IsDmlEntity: unique symbol;
export type DMLEntitySchemaBuilder<Schema extends DMLSchema> = DMLSchemaWithBigNumber<Schema> & DMLSchemaDefaults & Schema;
/**
 * Dml entity is a representation of a DML model with a unique
 * name, its schema and relationships.
 */
export declare class DmlEntity<const Schema extends DMLSchema, const TConfig extends IDmlEntityConfig> implements IDmlEntity<Schema, TConfig> {
    #private;
    [IsDmlEntity]: boolean;
    name: InferDmlEntityNameFromConfig<TConfig>;
    schema: Schema;
    constructor(nameOrConfig: TConfig, schema: Schema);
    /**
     * A static method to check if an entity is an instance of DmlEntity.
     * It allows us to identify a specific object as being an instance of
     * DmlEntity.
     *
     * @param entity
     */
    static isDmlEntity(entity: unknown): entity is DmlEntity<any, any>;
    /**
     * Parse entity to get its underlying information
     */
    parse(): {
        name: InferDmlEntityNameFromConfig<TConfig>;
        tableName: string;
        schema: DMLSchema;
        cascades: EntityCascades<string[], string[]>;
        indexes: EntityIndex<Schema>[];
        checks: CheckConstraint<Schema>[];
    };
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
    cascades(options: EntityCascades<ExtractEntityRelations<Schema, "hasOne" | "hasOneWithFK" | "hasMany">, ExtractEntityRelations<Schema, "manyToMany">>): this;
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
    indexes(indexes: EntityIndex<Schema, string | QueryCondition<Schema>>[]): this;
    checks(checks: CheckConstraint<Schema>[]): this;
}
export {};
//# sourceMappingURL=entity.d.ts.map