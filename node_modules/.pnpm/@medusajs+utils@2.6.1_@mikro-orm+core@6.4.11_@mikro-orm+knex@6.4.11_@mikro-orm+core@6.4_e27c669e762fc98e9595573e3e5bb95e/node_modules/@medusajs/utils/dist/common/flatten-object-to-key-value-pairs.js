"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenObjectToKeyValuePairs = flattenObjectToKeyValuePairs;
const is_object_1 = require("./is-object");
/*
  Given a deeply nested object that can be arrays or objects, this function will flatten
  it to an object that is 1 level deep.

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

  flattenObjectToKeyValuePairs(testObject) will return

  {
    "product.id": "test-product",
    "product.name": "Test Product",
    "product.categories.id": ["test-category"],
    "product.categories.name": ["Test Category"]
  }
*/
function flattenObjectToKeyValuePairs(obj) {
    const result = {};
    // Find all paths that contain arrays of objects
    function findArrayPaths(obj, currentPath = []) {
        const paths = [];
        if (!obj || typeof obj !== "object") {
            return paths;
        }
        // If it's an array of objects, add this path
        if (Array.isArray(obj) && obj.length > 0 && (0, is_object_1.isObject)(obj[0])) {
            paths.push(currentPath);
        }
        // Check all properties
        if ((0, is_object_1.isObject)(obj)) {
            Object.entries(obj).forEach(([key, value]) => {
                const newPath = [...currentPath, key];
                paths.push(...findArrayPaths(value, newPath));
            });
        }
        return paths;
    }
    // Extract array values at a specific path
    function getArrayValues(obj, path) {
        const arrayObj = path.reduce((acc, key) => {
            if (acc && (0, is_object_1.isObject)(acc)) {
                return acc[key];
            }
            return undefined;
        }, obj);
        if (!Array.isArray(arrayObj))
            return [];
        return arrayObj;
    }
    // Process non-array paths
    function processRegularPaths(obj, prefix = "") {
        if (!obj || typeof obj !== "object") {
            result[prefix] = obj;
            return;
        }
        if (Array.isArray(obj))
            return;
        Object.entries(obj).forEach(([key, value]) => {
            const newPrefix = prefix ? `${prefix}.${key}` : key;
            if (value && (0, is_object_1.isObject)(value) && !Array.isArray(value)) {
                processRegularPaths(value, newPrefix);
            }
            else if (!Array.isArray(value)) {
                result[newPrefix] = value;
            }
        });
    }
    // Process the object
    processRegularPaths(obj);
    // Find and process array paths
    const arrayPaths = findArrayPaths(obj);
    arrayPaths.forEach((path) => {
        const pathStr = path.join(".");
        const arrayObjects = getArrayValues(obj, path);
        if (Array.isArray(arrayObjects) && arrayObjects.length > 0) {
            // Get all possible keys from the array objects
            const keys = new Set();
            arrayObjects.forEach((item) => {
                if (item && (0, is_object_1.isObject)(item)) {
                    Object.keys(item).forEach((k) => keys.add(k));
                }
            });
            // Process each key
            keys.forEach((key) => {
                const values = arrayObjects
                    .map((item) => {
                    if (item && (0, is_object_1.isObject)(item)) {
                        return item[key];
                    }
                    return undefined;
                })
                    .filter((v) => v !== undefined);
                if (values.length > 0) {
                    const newPath = `${pathStr}.${key}`;
                    if (values.every((v) => (0, is_object_1.isObject)(v) && !Array.isArray(v))) {
                        // If these are all objects, recursively process them
                        const subObj = { [key]: values };
                        const subResult = flattenObjectToKeyValuePairs(subObj);
                        Object.entries(subResult).forEach(([k, v]) => {
                            const finalPath = `${pathStr}.${k}`;
                            result[finalPath] = v;
                        });
                    }
                    else {
                        result[newPath] = values;
                    }
                }
            });
        }
    });
    return result;
}
//# sourceMappingURL=flatten-object-to-key-value-pairs.js.map