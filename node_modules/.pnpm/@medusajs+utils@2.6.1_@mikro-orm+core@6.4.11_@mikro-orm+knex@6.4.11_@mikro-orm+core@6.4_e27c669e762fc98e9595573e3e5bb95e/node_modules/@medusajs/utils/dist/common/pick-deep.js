"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickDeep = pickDeep;
const is_object_1 = require("./is-object");
function pickDeep(input, fields, prefix = "") {
    if (!input) {
        return input;
    }
    return Object.entries(input).reduce((nextInput, [key, value]) => {
        const fieldKey = withPrefix(key, prefix);
        const fieldMatches = fields.includes(fieldKey);
        const partialKeyMatch = fields.filter((field) => field.toString().startsWith(`${fieldKey}.`))
            .length > 0;
        const valueIsObject = (0, is_object_1.isObject)(value);
        const valueIsArray = Array.isArray(value);
        if (fieldMatches && (valueIsObject || valueIsArray)) {
            nextInput[key] = value;
            return nextInput;
        }
        if (!fieldMatches && !partialKeyMatch) {
            return nextInput;
        }
        if (valueIsArray) {
            nextInput[key] = value.map((arrItem) => {
                if ((0, is_object_1.isObject)(arrItem)) {
                    return pickDeep(arrItem, fields, withPrefix(key, prefix));
                }
                return arrItem;
            });
            return nextInput;
        }
        else if (valueIsObject) {
            if (Object.keys(value).length) {
                nextInput[key] = pickDeep(value, fields, withPrefix(key, prefix));
            }
            return nextInput;
        }
        if (fieldMatches) {
            nextInput[key] = value;
        }
        return nextInput;
    }, {});
}
function withPrefix(key, prefix) {
    if (prefix.length) {
        return `${prefix}.${key}`;
    }
    else {
        return key;
    }
}
//# sourceMappingURL=pick-deep.js.map