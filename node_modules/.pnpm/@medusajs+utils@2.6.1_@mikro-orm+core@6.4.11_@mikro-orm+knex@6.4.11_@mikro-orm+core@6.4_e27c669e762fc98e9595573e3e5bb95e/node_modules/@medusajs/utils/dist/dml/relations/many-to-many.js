"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManyToMany = void 0;
const base_1 = require("./base");
/**
 * ManyToMany relationship defines a relationship between two entities
 * where the owner of the relationship has many instance of the
 * related entity via a pivot table.
 *
 * For example:
 *
 * - A user has many teams. But a team has many users as well. So this
 *   relationship requires a pivot table to establish a many to many
 *   relationship between two entities
 */
class ManyToMany extends base_1.BaseRelationship {
    constructor() {
        super(...arguments);
        this.type = "manyToMany";
    }
    static isManyToMany(relationship) {
        return relationship?.type === "manyToMany";
    }
}
exports.ManyToMany = ManyToMany;
//# sourceMappingURL=many-to-many.js.map