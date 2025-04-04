"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRawPropertiesFromBigNumber = createRawPropertiesFromBigNumber;
const bignumber_js_1 = require("bignumber.js");
const common_1 = require("../common");
const big_number_1 = require("./big-number");
function createRawPropertiesFromBigNumber(obj, { prefix = "raw_", exclude = [], } = {}) {
    const isBigNumber = (value) => {
        return (typeof value === "object" &&
            (0, common_1.isDefined)(value.raw_) &&
            (0, common_1.isDefined)(value.numeric_));
    };
    const stack = [{ current: obj, path: "" }];
    while (stack.length > 0) {
        const { current, path } = stack.pop();
        if (current == null ||
            typeof current !== "object" ||
            isBigNumber(current) ||
            path.includes("." + prefix)) {
            continue;
        }
        if (Array.isArray(current)) {
            current.forEach((element, index) => stack.push({ current: element, path }));
        }
        else {
            for (const key of Object.keys(current)) {
                let value = current[key];
                const currentPath = path ? `${path}.${key}` : key;
                if (value != null && !exclude.includes(currentPath)) {
                    const isBigNumberJS = bignumber_js_1.BigNumber.isBigNumber(value);
                    if (isBigNumberJS) {
                        current[key] = new big_number_1.BigNumber(current[key]);
                        value = current[key];
                    }
                    if (isBigNumber(value)) {
                        const newKey = prefix + key;
                        const newPath = path ? `${path}.${newKey}` : newKey;
                        if (!exclude.includes(newPath)) {
                            current[newKey] = {
                                ...value.raw_,
                                value: (0, common_1.trimZeros)(value.raw_.value),
                            };
                            continue;
                        }
                    }
                }
                stack.push({ current: value, path: currentPath });
            }
        }
    }
}
//# sourceMappingURL=create-raw-properties-from-bignumber.js.map