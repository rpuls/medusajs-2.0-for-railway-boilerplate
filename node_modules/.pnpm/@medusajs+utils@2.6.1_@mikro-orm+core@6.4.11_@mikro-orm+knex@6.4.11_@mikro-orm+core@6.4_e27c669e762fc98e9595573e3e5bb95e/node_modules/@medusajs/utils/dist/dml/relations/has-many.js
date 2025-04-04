"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HasMany = void 0;
const base_1 = require("./base");
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
class HasMany extends base_1.BaseRelationship {
    constructor() {
        super(...arguments);
        this.type = "hasMany";
    }
    static isHasMany(relationship) {
        return relationship?.type === "hasMany";
    }
}
exports.HasMany = HasMany;
//# sourceMappingURL=has-many.js.map