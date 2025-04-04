"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumProperty = void 0;
const base_1 = require("./base");
/**
 * The EnumProperty is used to define a property with pre-defined
 * list of choices.
 */
class EnumProperty extends base_1.BaseProperty {
    constructor(values) {
        super();
        if (Array.isArray(values)) {
            this.dataType = {
                name: "enum",
                options: { choices: values },
            };
        }
        else {
            this.dataType = {
                name: "enum",
                options: { choices: Object.values(values) },
            };
        }
    }
}
exports.EnumProperty = EnumProperty;
//# sourceMappingURL=enum.js.map