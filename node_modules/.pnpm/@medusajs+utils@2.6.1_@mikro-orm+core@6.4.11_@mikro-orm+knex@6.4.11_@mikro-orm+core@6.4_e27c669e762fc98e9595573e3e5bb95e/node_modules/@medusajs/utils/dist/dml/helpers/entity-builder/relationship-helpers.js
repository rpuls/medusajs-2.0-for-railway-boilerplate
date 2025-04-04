"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getForeignKey = getForeignKey;
const camel_to_snake_case_1 = require("../../../common/camel-to-snake-case");
/**
 * Returns the foreign key name for a relationship
 */
function getForeignKey(relationship) {
    return (relationship.options.foreignKeyName ??
        (0, camel_to_snake_case_1.camelToSnakeCase)(`${relationship.name}Id`));
}
//# sourceMappingURL=relationship-helpers.js.map