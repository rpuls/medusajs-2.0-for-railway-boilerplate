"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEntityId = generateEntityId;
const ulid_1 = require("ulid");
/**
 * Generate a composed id based on the input parameters and return either the is if it exists or the generated one.
 * @param idProperty
 * @param prefix
 */
function generateEntityId(idProperty, prefix) {
    if (idProperty) {
        return idProperty;
    }
    const id = (0, ulid_1.ulid)();
    prefix = prefix ? `${prefix}_` : "";
    return `${prefix}${id}`;
}
//# sourceMappingURL=generate-entity-id.js.map