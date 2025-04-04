"use strict";
// Those utils are used in a typeorm context and we can't be sure that they can be used elsewhere
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSelects = buildSelects;
exports.buildRelations = buildRelations;
exports.buildOrder = buildOrder;
const object_from_string_path_1 = require("./object-from-string-path");
function buildSelects(selectCollection) {
    return buildRelationsOrSelect(selectCollection);
}
function buildRelations(relationCollection) {
    return buildRelationsOrSelect(relationCollection);
}
function buildRelationsOrSelect(collection) {
    return (0, object_from_string_path_1.objectFromStringPath)(collection);
}
/**
 * Convert an order of dot string into a nested object
 * @example
 * input: { id: "ASC", "items.title": "ASC", "items.variant.title": "ASC" }
 * output: {
 *   "id": "ASC",
 *   "items": {
 *     "id": "ASC",
 *     "variant": {
 *        "title": "ASC"
 *     }
 *   },
 * }
 * @param orderBy
 */
function buildOrder(orderBy) {
    const output = {};
    const orderKeys = Object.keys(orderBy);
    for (const order of orderKeys) {
        if (order.indexOf(".") > -1) {
            const nestedOrder = order.split(".");
            let parent = output;
            while (nestedOrder.length > 1) {
                const nestedRelation = nestedOrder.shift();
                parent = parent[nestedRelation] ??= {};
            }
            parent[nestedOrder[0]] = orderBy[order];
            continue;
        }
        output[order] = orderBy[order];
    }
    return output;
}
//# sourceMappingURL=build-query.js.map