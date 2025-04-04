"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectToStringPath = objectToStringPath;
const is_object_1 = require("./is-object");
/**
 * Converts a structure of find options to an
 * array of string paths
 * @example
 * // With `includeTruePropertiesOnly` default value set to false
 * const result = objectToStringPath({
 *   test: {
 *     test1: true,
 *     test2: true,
 *     test3: {
 *       test4: true
 *     },
 *   },
 *   test2: true
 * })
 * console.log(result)
 * // output: ['test', 'test.test1', 'test.test2', 'test.test3', 'test.test3.test4', 'test2']
 *
 * @example
 * // With `includeTruePropertiesOnly` set to true
 * const result = objectToStringPath({
 *   test: {
 *     test1: true,
 *     test2: true,
 *     test3: {
 *       test4: true
 *     },
 *   },
 *   test2: true
 * }, {
 *   includeTruePropertiesOnly: true
 * })
 * console.log(result)
 * // output: ['test.test1', 'test.test2', 'test.test3.test4', 'test2']
 *
 * @param {InputObject} input
 * @param {boolean} includeParentPropertyFields If set to true (example 1), all properties will be included as well as the parents,
 * otherwise (example 2) all properties path set to true will included, excluded the parents
 */
function objectToStringPath(input = {}, { includeParentPropertyFields } = {
    includeParentPropertyFields: true,
}) {
    if (!(0, is_object_1.isObject)(input) || !Object.keys(input).length) {
        return [];
    }
    const output = includeParentPropertyFields
        ? new Set(Object.keys(input))
        : new Set();
    for (const key of Object.keys(input)) {
        if ((0, is_object_1.isObject)(input[key])) {
            const deepRes = objectToStringPath(input[key], {
                includeParentPropertyFields,
            });
            const items = deepRes.reduce((acc, val) => {
                acc.push(`${key}.${val}`);
                return acc;
            }, []);
            items.forEach((item) => output.add(item));
            continue;
        }
        if ((0, is_object_1.isObject)(key) || input[key] === true) {
            output.add(key);
        }
    }
    return Array.from(output);
}
//# sourceMappingURL=object-to-string-path.js.map