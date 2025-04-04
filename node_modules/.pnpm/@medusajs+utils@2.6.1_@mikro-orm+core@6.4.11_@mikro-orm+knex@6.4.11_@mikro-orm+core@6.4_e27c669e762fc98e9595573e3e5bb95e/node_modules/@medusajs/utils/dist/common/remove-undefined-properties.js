"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUndefinedProperties = removeUndefinedProperties;
const is_defined_1 = require("./is-defined");
function removeUndefinedProperties(inputObj) {
    const removeProperties = (obj) => {
        const res = {};
        Object.keys(obj).reduce((acc, key) => {
            if (typeof obj[key] === "undefined") {
                return acc;
            }
            acc[key] = removeUndefinedDeeply(obj[key]);
            return acc;
        }, res);
        return res;
    };
    return removeProperties(inputObj);
}
function removeUndefinedDeeply(input) {
    if ((0, is_defined_1.isDefined)(input)) {
        if (input === null || input === "null") {
            return null;
        }
        else if (Array.isArray(input)) {
            return input
                .map((item) => {
                return removeUndefinedDeeply(item);
            })
                .filter((v) => (0, is_defined_1.isDefined)(v));
        }
        else if (Object.prototype.toString.call(input) === "[object Date]") {
            return input;
        }
        else if (typeof input === "object") {
            return Object.keys(input).reduce((acc, key) => {
                if (typeof input[key] === "undefined") {
                    return acc;
                }
                acc[key] = removeUndefinedDeeply(input[key]);
                return acc;
            }, {});
        }
        else {
            return input;
        }
    }
}
//# sourceMappingURL=remove-undefined-properties.js.map