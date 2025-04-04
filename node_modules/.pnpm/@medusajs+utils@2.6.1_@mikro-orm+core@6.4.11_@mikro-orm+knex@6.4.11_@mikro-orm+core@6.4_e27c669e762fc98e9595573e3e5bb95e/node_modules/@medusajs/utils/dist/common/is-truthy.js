"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTruthy = isTruthy;
/**
 * Return true if the value is truthy and otherwise false
 * @param val
 */
function isTruthy(val) {
    if (typeof val === "string") {
        return val.toLowerCase() === "true";
    }
    return !!val;
}
//# sourceMappingURL=is-truthy.js.map