"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unflattenObjectKeys = unflattenObjectKeys;
const is_object_1 = require("./is-object");
/**
 * unFlatten object keys
 * @example
 * input: {
 *   "variants.sku": { $like: "%-1" },
 *   "variants.prices.amount": { $gt: 30 },
 *   "variants.prices.currency": "USD"
 * }
 *
 * output: {
 *   {
 *       "variants": {
 *         "sku": {
 *           "$like": "%-1"
 *         },
 *         "prices": {
 *           "amount": {
 *             "$gt": 30
 *           },
 *           "currency": "USD"
 *         }
 *       }
 *     }
 * }
 *
 * @param input
 */
function unflattenObjectKeys(flattened) {
    const result = {};
    for (const key in flattened) {
        if (!key.includes(".")) {
            if ((0, is_object_1.isObject)(result[key])) {
                result[key] = { ...result[key], ...flattened[key] };
            }
            else {
                result[key] = flattened[key];
            }
        }
    }
    for (const key in flattened) {
        if (key.includes(".")) {
            const value = flattened[key];
            const keys = key.split(".");
            let current = result;
            for (let i = 0; i < keys.length; i++) {
                const part = keys[i];
                if (i === keys.length - 1) {
                    if ((0, is_object_1.isObject)(value) && current[part]) {
                        current[part] = { ...current[part], ...value };
                    }
                    else {
                        current[part] = value;
                    }
                }
                else {
                    current = current[part] = current[part] ?? {};
                }
            }
        }
    }
    return result;
}
//# sourceMappingURL=unflatten-object-keys.js.map