import { BaseRelationship } from "./base";
import { RelationNullableModifier } from "./nullable";
export declare class BelongsTo<T, const OptionalForeignKeyName extends string | undefined = undefined> extends BaseRelationship<T> {
    type: "belongsTo";
    $foreignKey: true;
    $foreignKeyName: OptionalForeignKeyName;
    static isBelongsTo<T>(relationship: any): relationship is BelongsTo<T, any>;
    /**
     * Apply nullable modifier on the schema
     */
    nullable(): RelationNullableModifier<T, BelongsTo<T, OptionalForeignKeyName>, true>;
}
//# sourceMappingURL=belongs-to.d.ts.map