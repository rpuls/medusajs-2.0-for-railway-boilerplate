"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanProperty = void 0;
const base_1 = require("./base");
/**
 * The BooleanProperty class is used to define a boolean
 * property
 */
class BooleanProperty extends base_1.BaseProperty {
    constructor() {
        super(...arguments);
        this.dataType = {
            name: "boolean",
        };
    }
}
exports.BooleanProperty = BooleanProperty;
//# sourceMappingURL=boolean.js.map