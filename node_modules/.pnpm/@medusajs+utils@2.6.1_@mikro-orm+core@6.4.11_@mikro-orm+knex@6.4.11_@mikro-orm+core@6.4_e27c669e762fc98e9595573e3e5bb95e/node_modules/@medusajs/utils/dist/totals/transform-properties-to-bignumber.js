"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformPropertiesToBigNumber = transformPropertiesToBigNumber;
const big_number_1 = require("./big-number");
function transformPropertiesToBigNumber(obj, { prefix = "raw_", include = [], exclude = [], } = {}) {
    const stack = [{ current: obj, path: "" }];
    while (stack.length > 0) {
        const { current, path } = stack.pop();
        if (current == null ||
            typeof current !== "object" ||
            current instanceof big_number_1.BigNumber) {
            continue;
        }
        if (Array.isArray(current)) {
            current.forEach((element, index) => stack.push({ current: element, path }));
        }
        else {
            for (const key of Object.keys(current)) {
                const value = current[key];
                const currentPath = path ? `${path}.${key}` : key;
                if (value != null && !exclude.includes(currentPath)) {
                    if (key.startsWith(prefix)) {
                        const newKey = key.replace(prefix, "");
                        const newPath = path ? `${path}.${newKey}` : newKey;
                        if (!exclude.includes(newPath)) {
                            current[newKey] = new big_number_1.BigNumber(value);
                            continue;
                        }
                    }
                    else if (include.includes(currentPath)) {
                        current[key] = new big_number_1.BigNumber(value);
                        continue;
                    }
                }
                stack.push({ current: value, path: currentPath });
            }
        }
    }
}
//# sourceMappingURL=transform-properties-to-bignumber.js.map