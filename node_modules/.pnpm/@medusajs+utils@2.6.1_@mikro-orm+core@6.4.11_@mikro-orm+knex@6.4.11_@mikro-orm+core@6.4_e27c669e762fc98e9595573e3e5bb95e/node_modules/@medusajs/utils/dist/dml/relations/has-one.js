"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HasOne = void 0;
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
class HasOne extends base_1.BaseRelationship {
    constructor() {
        super(...arguments);
        this.type = "hasOne";
    }
    static isHasOne(relationship) {
        return relationship?.type === "hasOne";
    }
    /**
     * Apply nullable modifier on the schema
     */
    nullable() {
        return new nullable_1.RelationNullableModifier(this);
    }
}
exports.HasOne = HasOne;
//# sourceMappingURL=has-one.js.map