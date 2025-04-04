"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenObjectKeys = flattenObjectKeys;
const query_builder_1 = require("./query-builder");
/**
 * Flatten object keys
 * @example
 * input: {
 *   a: 1,
 *   b: {
 *     c: 2,
 *     d: 3,
 *   },
 *   e: 4,
 * }
 *
 * output: {
 *   a: 1,
 *   b.c: 2,
 *   b.d: 3,
 *   e: 4,
 * }
 *
 * @param input
 */
function flattenObjectKeys(input) {
    const result = {};
    function flatten(obj, path) {
        for (const key in obj) {
            const isOperatorMap = !!query_builder_1.OPERATOR_MAP[key];
            if (isOperatorMap) {
                result[path ?? key] = obj;
                continue;
            }
            const newPath = path ? `${path}.${key}` : key;
            if (obj[key] === null) {
                result[newPath] = null;
                continue;
            }
            if (Array.isArray(obj[key])) {
                result[newPath] = obj[key];
                continue;
            }
            if (typeof obj[key] === "object" && !isOperatorMap) {
                flatten(obj[key], newPath);
                continue;
            }
            result[newPath] = obj[key];
        }
    }
    flatten(input);
    return result;
}
//# sourceMappingURL=flatten-object-keys.js.map