"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTimeProperty = void 0;
const base_1 = require("./base");
/**
 * The DateTimeProperty class is used to define a timestampz
 * property
 */
class DateTimeProperty extends base_1.BaseProperty {
    constructor() {
        super(...arguments);
        this.dataType = {
            name: "dateTime",
        };
    }
}
exports.DateTimeProperty = DateTimeProperty;
//# sourceMappingURL=date-time.js.map