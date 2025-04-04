"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONProperty = void 0;
const base_1 = require("./base");
/**
 * The JSONProperty is used to define a property that stores
 * data as a JSON string
 */
class JSONProperty extends base_1.BaseProperty {
    constructor() {
        super(...arguments);
        this.dataType = {
            name: "json",
        };
    }
}
exports.JSONProperty = JSONProperty;
//# sourceMappingURL=json.js.map