"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeNullish = removeNullish;
const is_defined_1 = require("./is-defined");
function removeNullish(obj) {
    return Object.entries(obj).reduce((resultObject, [currentKey, currentValue]) => {
        if (!(0, is_defined_1.isDefined)(currentValue) || currentValue === null) {
            return resultObject;
        }
        resultObject[currentKey] = currentValue;
        return resultObject;
    }, {});
}
//# sourceMappingURL=remove-nullisih.js.map