"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatProperty = void 0;
const base_1 = require("./base");
/**
 * The FloatProperty is used to define values with decimal
 * places.
 */
class FloatProperty extends base_1.BaseProperty {
    constructor() {
        super(...arguments);
        this.dataType = {
            name: "float",
        };
    }
    static isFloatProperty(obj) {
        return obj?.dataType?.name === "float";
    }
}
exports.FloatProperty = FloatProperty;
//# sourceMappingURL=float.js.map