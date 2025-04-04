"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickValueFromObject = pickValueFromObject;
const is_defined_1 = require("./is-defined");
const is_object_1 = require("./is-object");
function pickValueFromObject(path, object) {
    const segments = path.split(".");
    let result = object;
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        result = result[segment];
        if (!(0, is_defined_1.isDefined)(result)) {
            return;
        }
        if (i === segments.length - 1) {
            return result;
        }
        if (Array.isArray(result)) {
            const subPath = segments.slice(i + 1).join(".");
            return result.map((item) => pickValueFromObject(subPath, item)).flat();
        }
        if (!(0, is_object_1.isObject)(result)) {
            return result;
        }
    }
    return result;
}
//# sourceMappingURL=pick-value-from-object.js.map