"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBigNumber = isBigNumber;
const is_object_1 = require("./is-object");
function isBigNumber(obj) {
    return (0, is_object_1.isObject)(obj) && "value" in obj;
}
//# sourceMappingURL=is-big-number.js.map