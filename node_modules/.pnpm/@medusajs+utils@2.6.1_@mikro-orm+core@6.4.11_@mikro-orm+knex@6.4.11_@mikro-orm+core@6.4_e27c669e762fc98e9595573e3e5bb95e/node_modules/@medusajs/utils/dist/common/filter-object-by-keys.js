"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterObjectByKeys = filterObjectByKeys;
const is_defined_1 = require("./is-defined");
/*
  Given an array of keys that are object paths (like product.categories.id), this function will
  return an object that contains keys from those object paths

  Given an object: testObject = {
    product: {
      id: "test-product",
      name: "Test Product",
      categories: [{
        id: "test-category",
        name: "Test Category"
      }]
    }
  }

  filterObjectByKeys(testObject, ['product.categories.id']) will return

  {
    product: {
      categories: [{
        id: "test-category"
      }]
    }
  }
*/
function filterObjectByKeys(obj, paths) {
    function buildObject(paths) {
        const result = {};
        paths.forEach((path) => {
            const parts = path.split(".");
            // Handle top-level properties
            if (parts.length === 1) {
                const [part] = parts;
                if (obj[part] !== undefined) {
                    result[part] = obj[part];
                }
                return;
            }
            let current = result;
            let source = obj;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                const isLast = i === parts.length - 1;
                if (!(0, is_defined_1.isDefined)(current) || source === null) {
                    return;
                }
                // Initialize the current path if it doesn't exist
                if (!current[part]) {
                    if (Array.isArray(source[part])) {
                        current[part] = source[part].map(() => ({}));
                    }
                    else if (source[part] === null) {
                        current[part] = null;
                    }
                    else if ((0, is_defined_1.isDefined)(source[part])) {
                        current[part] = {};
                    }
                }
                if (Array.isArray(source[part])) {
                    // Get the array path base (e.g., "customer.groups")
                    const arrayPath = parts.slice(0, i + 1).join(".");
                    // Find all paths that start with this array path
                    const relevantPaths = paths
                        .filter((p) => p.startsWith(arrayPath + "."))
                        .map((p) => p.slice(arrayPath.length + 1)); // Remove the array path prefix
                    // Update array items with all relevant properties
                    current[part] = source[part].map((item, idx) => {
                        const existingItem = current[part][idx] || {};
                        relevantPaths.forEach((subPath) => {
                            const value = subPath
                                .split(".")
                                .reduce((obj, key) => obj?.[key], item);
                            if (value !== undefined) {
                                let tempObj = existingItem;
                                const keys = subPath.split(".");
                                keys.slice(0, -1).forEach((key) => {
                                    tempObj[key] = tempObj[key] || {};
                                    tempObj = tempObj[key];
                                });
                                tempObj[keys[keys.length - 1]] = value;
                            }
                        });
                        return existingItem;
                    });
                    break;
                }
                else {
                    if (isLast) {
                        current[part] = source[part];
                    }
                    else {
                        current = current[part];
                        source = source[part];
                    }
                }
            }
        });
        return result;
    }
    return buildObject(paths);
}
//# sourceMappingURL=filter-object-by-keys.js.map