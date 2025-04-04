"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BelongsTo = void 0;
const base_1 = require("./base");
const nullable_1 = require("./nullable");
class BelongsTo extends base_1.BaseRelationship {
    constructor() {
        super(...arguments);
        this.type = "belongsTo";
    }
    static isBelongsTo(relationship) {
        return relationship?.type === "belongsTo";
    }
    /**
     * Apply nullable modifier on the schema
     */
    nullable() {
        return new nullable_1.RelationNullableModifier(this);
    }
}
exports.BelongsTo = BelongsTo;
//# sourceMappingURL=belongs-to.js.map