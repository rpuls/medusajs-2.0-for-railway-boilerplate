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
export declare class HasOne<T> extends BaseRelationship<T> {
    type: "hasOne";
    static isHasOne<T>(relationship: any): relationship is HasOne<T>;
    /**
     * Apply nullable modifier on the schema
     */
    nullable(): RelationNullableModifier<T, HasOne<T>, false>;
}
//# sourceMappingURL=has-one.d.ts.map