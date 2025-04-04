"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayProperty = void 0;
const base_1 = require("./base");
/**
 * The ArrayProperty is used to define an array property
 */
class ArrayProperty extends base_1.BaseProperty {
    constructor() {
        super(...arguments);
        this.dataType = {
            name: "array",
        };
    }
}
exports.ArrayProperty = ArrayProperty;
//# sourceMappingURL=array.js.map