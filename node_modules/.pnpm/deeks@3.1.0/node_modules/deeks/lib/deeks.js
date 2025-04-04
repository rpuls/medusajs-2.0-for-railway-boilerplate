'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepKeysFromList = exports.deepKeys = void 0;
const utils = __importStar(require("./utils"));
__exportStar(require("./types"), exports);
/**
 * Return the deep keys list for a single document
 * @param object
 * @param options
 * @returns {Array}
 */
function deepKeys(object, options) {
    const parsedOptions = mergeOptions(options);
    if (typeof object === 'object' && object !== null) {
        return generateDeepKeysList('', object, parsedOptions);
    }
    return [];
}
exports.deepKeys = deepKeys;
/**
 * Return the deep keys list for all documents in the provided list
 * @param list
 * @param options
 * @returns Array[Array[String]]
 */
function deepKeysFromList(list, options) {
    const parsedOptions = mergeOptions(options);
    return list.map((document) => {
        if (typeof document === 'object' && document !== null) {
            // if the data at the key is a document, then we retrieve the subHeading starting with an empty string heading and the doc
            return deepKeys(document, parsedOptions);
        }
        return [];
    });
}
exports.deepKeysFromList = deepKeysFromList;
function generateDeepKeysList(heading, data, options) {
    const keys = Object.keys(data).map((currentKey) => {
        // If the given heading is empty, then we set the heading to be the subKey, otherwise set it as a nested heading w/ a dot
        const keyName = buildKeyName(heading, escapeNestedDotsIfSpecified(currentKey, options));
        // If we have another nested document, recur on the sub-document to retrieve the full key name
        if (options.expandNestedObjects && utils.isDocumentToRecurOn(data[currentKey]) || (options.arrayIndexesAsKeys && Array.isArray(data[currentKey]) && data[currentKey].length)) {
            return generateDeepKeysList(keyName, data[currentKey], options);
        }
        else if (options.expandArrayObjects && Array.isArray(data[currentKey])) {
            // If we have a nested array that we need to recur on
            return processArrayKeys(data[currentKey], keyName, options);
        }
        else if (options.ignoreEmptyArrays && Array.isArray(data[currentKey]) && !data[currentKey].length) {
            return [];
        }
        // Otherwise return this key name since we don't have a sub document
        return keyName;
    });
    return utils.flatten(keys);
}
/**
 * Helper function to handle the processing of arrays when the expandArrayObjects
 * option is specified.
 * @param subArray
 * @param currentKeyPath
 * @param options
 * @returns {*}
 */
function processArrayKeys(subArray, currentKeyPath, options) {
    let subArrayKeys = deepKeysFromList(subArray, options);
    if (!subArray.length) {
        return options.ignoreEmptyArraysWhenExpanding ? [] : [currentKeyPath];
    }
    else if (subArray.length && utils.flatten(subArrayKeys).length === 0) {
        // Has items in the array, but no objects
        return [currentKeyPath];
    }
    else {
        subArrayKeys = subArrayKeys.map((schemaKeys) => {
            if (Array.isArray(schemaKeys) && schemaKeys.length === 0) {
                return [currentKeyPath];
            }
            return schemaKeys.map((subKey) => buildKeyName(currentKeyPath, escapeNestedDotsIfSpecified(subKey, options)));
        });
        return utils.unique(utils.flatten(subArrayKeys));
    }
}
function escapeNestedDotsIfSpecified(key, options) {
    if (options.escapeNestedDots) {
        return key.replace(/\./g, '\\.');
    }
    return key;
}
/**
 * Function used to generate the key path
 * @param upperKeyName String accumulated key path
 * @param currentKeyName String current key name
 * @returns String
 */
function buildKeyName(upperKeyName, currentKeyName) {
    if (upperKeyName) {
        return upperKeyName + '.' + currentKeyName;
    }
    return currentKeyName;
}
function mergeOptions(options) {
    return {
        arrayIndexesAsKeys: false,
        expandNestedObjects: true,
        expandArrayObjects: false,
        ignoreEmptyArraysWhenExpanding: false,
        escapeNestedDots: false,
        ignoreEmptyArrays: false,
        ...(options ?? {})
    };
}
