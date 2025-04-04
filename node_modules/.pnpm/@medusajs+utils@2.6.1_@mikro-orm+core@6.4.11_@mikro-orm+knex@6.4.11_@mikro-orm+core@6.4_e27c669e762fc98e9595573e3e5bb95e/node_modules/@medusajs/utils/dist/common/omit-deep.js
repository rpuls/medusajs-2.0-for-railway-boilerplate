"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.omitDeep = omitDeep;
const is_object_1 = require("./is-object");
function omitDeep(input, excludes) {
    if (!input) {
        return input;
    }
    return Object.entries(input).reduce((nextInput, [key, value]) => {
        const shouldExclude = excludes.includes(key);
        if (shouldExclude) {
            return nextInput;
        }
        if (Array.isArray(value)) {
            nextInput[key] = value.map((arrItem) => {
                if ((0, is_object_1.isObject)(arrItem)) {
                    return omitDeep(arrItem, excludes);
                }
                return arrItem;
            });
            return nextInput;
        }
        else if ((0, is_object_1.isObject)(value)) {
            nextInput[key] = omitDeep(value, excludes);
            return nextInput;
        }
        nextInput[key] = value;
        return nextInput;
    }, {});
}
//# sourceMappingURL=omit-deep.js.map