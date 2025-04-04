import { BaseRelationship } from "./base";
import { RelationNullableModifier } from "./nullable";
/**
 * HasOne relationship defines a relationship between two entities
 * where the owner of the relationship has exactly one instance
 * of the related entity.
 *
 * For example: A user HasOne profile
 *
 * You may use the "BelongsTo" relationship to define the inverse
 * of the "HasOne" relationship
 */
export declare class HasOneWithForeignKey<T, const OptionalForeignKeyName extends string | undefined = undefined> extends BaseRelationship<T> {
    type: "hasOneWithFK";
    $foreignKey: true;
    $foreignKeyName: OptionalForeignKeyName;
    static isHasOneWithForeignKey<T>(relationship: any): relationship is HasOneWithForeignKey<T, any>;
    /**
     * Apply nullable modifier on the schema
     */
    nullable(): RelationNullableModifier<T, HasOneWithForeignKey<T, OptionalForeignKeyName>, true>;
}
//# sourceMappingURL=has-one-fk.d.ts.map