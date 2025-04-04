"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepMerge = deepMerge;
const is_object_1 = require("./is-object");
function deepMerge(target, source) {
    const recursive = (a, b) => {
        if (!(0, is_object_1.isObject)(a)) {
            return b;
        }
        if (!(0, is_object_1.isObject)(b)) {
            return a;
        }
        Object.keys(b).forEach((key) => {
            if ((0, is_object_1.isObject)(b[key])) {
                a[key] ??= {};
                a[key] = deepMerge(a[key], b[key]);
            }
            else {
                a[key] = b[key];
            }
        });
        return a;
    };
    const copy = { ...target };
    return recursive(copy, source);
}
//# sourceMappingURL=deep-merge.js.map