import { BaseRelationship } from "./base";
/**
 * HasMany relationship defines a relationship between two entities
 * where the owner of the relationship has many instance of the
 * related entity.
 *
 * For example:
 *
 * - A user HasMany books
 * - A user HasMany addresses
 */
export declare class HasMany<T> extends BaseRelationship<T> {
    type: "hasMany";
    static isHasMany<T>(relationship: any): relationship is HasMany<T>;
}
//# sourceMappingURL=has-many.d.ts.map