"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigNumberProperty = void 0;
const base_1 = require("./base");
/**
 * The NumberProperty is used to define a numeric/integer
 * property
 */
class BigNumberProperty extends base_1.BaseProperty {
    constructor() {
        super(...arguments);
        this.dataType = {
            name: "bigNumber",
        };
    }
    static isBigNumberProperty(obj) {
        return obj?.dataType?.name === "bigNumber";
    }
}
exports.BigNumberProperty = BigNumberProperty;
//# sourceMappingURL=big-number.js.map