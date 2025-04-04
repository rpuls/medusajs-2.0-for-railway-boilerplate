"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HasOneWithForeignKey = void 0;
const base_1 = require("./base");
const nullable_1 = require("./nullable");
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
class HasOneWithForeignKey extends base_1.BaseRelationship {
    constructor() {
        super(...arguments);
        this.type = "hasOneWithFK";
    }
    static isHasOneWithForeignKey(relationship) {
        return relationship?.type === "hasOneWithFK";
    }
    /**
     * Apply nullable modifier on the schema
     */
    nullable() {
        return new nullable_1.RelationNullableModifier(this);
    }
}
exports.HasOneWithForeignKey = HasOneWithForeignKey;
//# sourceMappingURL=has-one-fk.js.map