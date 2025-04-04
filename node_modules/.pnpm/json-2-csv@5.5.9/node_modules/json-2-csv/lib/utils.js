'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInvalid = exports.flatten = exports.unique = exports.arrayDifference = exports.isError = exports.isUndefined = exports.isNull = exports.isObject = exports.isString = exports.isNumber = exports.unwind = exports.getNCharacters = exports.removeEmptyFields = exports.isEmptyField = exports.computeSchemaDifferences = exports.isDateRepresentation = exports.isStringRepresentation = exports.deepCopy = exports.validate = exports.buildC2JOptions = exports.buildJ2COptions = void 0;
const doc_path_1 = require("doc-path");
const constants_1 = require("./constants");
const dateStringRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/, MAX_ARRAY_LENGTH = 100000;
/**
 * Build the options to be passed to the appropriate function
 * If a user does not provide custom options, then we use our default
 * If options are provided, then we set each valid key that was passed
 */
function buildJ2COptions(opts) {
    return {
        ...constants_1.defaultJson2CsvOptions,
        ...opts,
        delimiter: {
            field: opts?.delimiter?.field ?? constants_1.defaultJson2CsvOptions.delimiter.field,
            wrap: opts?.delimiter?.wrap || constants_1.defaultJson2CsvOptions.delimiter.wrap,
            eol: opts?.delimiter?.eol || constants_1.defaultJson2CsvOptions.delimiter.eol,
        },
        fieldTitleMap: Object.create({}),
    };
}
exports.buildJ2COptions = buildJ2COptions;
/**
 * Build the options to be passed to the appropriate function
 * If a user does not provide custom options, then we use our default
 * If options are provided, then we set each valid key that was passed
 */
function buildC2JOptions(opts) {
    return {
        ...constants_1.defaultCsv2JsonOptions,
        ...opts,
        delimiter: {
            field: opts?.delimiter?.field ?? constants_1.defaultCsv2JsonOptions.delimiter.field,
            wrap: opts?.delimiter?.wrap || constants_1.defaultCsv2JsonOptions.delimiter.wrap,
            eol: opts?.delimiter?.eol || constants_1.defaultCsv2JsonOptions.delimiter.eol,
        },
    };
}
exports.buildC2JOptions = buildC2JOptions;
function validate(data, validationFn, errorMessages) {
    if (!data)
        throw new Error(`${errorMessages.cannotCallOn} ${data}.`);
    if (!validationFn(data))
        throw new Error(errorMessages.dataCheckFailure);
    return true;
}
exports.validate = validate;
/**
 * Utility function to deep copy an object, used by the module tests
 */
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}
exports.deepCopy = deepCopy;
/**
 * Helper function that determines whether the provided value is a representation
 *   of a string. Given the RFC4180 requirements, that means that the value is
 *   wrapped in value wrap delimiters (usually a quotation mark on each side).
 */
function isStringRepresentation(fieldValue, options) {
    const firstChar = fieldValue[0], lastIndex = fieldValue.length - 1, lastChar = fieldValue[lastIndex];
    // If the field starts and ends with a wrap delimiter
    return firstChar === options.delimiter.wrap && lastChar === options.delimiter.wrap;
}
exports.isStringRepresentation = isStringRepresentation;
/**
 * Helper function that determines whether the provided value is a representation
 *   of a date.
 */
function isDateRepresentation(fieldValue) {
    return dateStringRegex.test(fieldValue);
}
exports.isDateRepresentation = isDateRepresentation;
/**
 * Helper function that determines the schema differences between two objects.
 */
function computeSchemaDifferences(schemaA, schemaB) {
    return arrayDifference(schemaA, schemaB)
        .concat(arrayDifference(schemaB, schemaA));
}
exports.computeSchemaDifferences = computeSchemaDifferences;
/**
 * Utility function to check if a field is considered empty so that the emptyFieldValue can be used instead
 */
function isEmptyField(fieldValue) {
    return isUndefined(fieldValue) || isNull(fieldValue) || fieldValue === '';
}
exports.isEmptyField = isEmptyField;
/**
 * Helper function that removes empty field values from an array.
 */
function removeEmptyFields(fields) {
    return fields.filter((field) => !isEmptyField(field));
}
exports.removeEmptyFields = removeEmptyFields;
/**
 * Helper function that retrieves the next n characters from the start index in
 *   the string including the character at the start index. This is used to
 *   check if are currently at an EOL value, since it could be multiple
 *   characters in length (eg. '\r\n')
 */
function getNCharacters(str, start, n) {
    return str.substring(start, start + n);
}
exports.getNCharacters = getNCharacters;
/**
 * The following unwind functionality is a heavily modified version of @edwincen's
 * unwind extension for lodash. Since lodash is a large package to require in,
 * and all of the required functionality was already being imported, either
 * natively or with doc-path, I decided to rewrite the majority of the logic
 * so that an additional dependency would not be required. The original code
 * with the lodash dependency can be found here:
 *
 * https://github.com/edwincen/unwind/blob/master/index.js
 */
/**
 * Core function that unwinds an item at the provided path
 */
function unwindItem(accumulator, item, fieldPath) {
    const valueToUnwind = (0, doc_path_1.evaluatePath)(item, fieldPath);
    let cloned = deepCopy(item);
    if (Array.isArray(valueToUnwind) && valueToUnwind.length) {
        valueToUnwind.forEach((val) => {
            cloned = deepCopy(item);
            accumulator.push((0, doc_path_1.setPath)(cloned, fieldPath, val));
        });
    }
    else if (Array.isArray(valueToUnwind) && valueToUnwind.length === 0) {
        // Push an empty string so the value is empty since there are no values
        (0, doc_path_1.setPath)(cloned, fieldPath, '');
        accumulator.push(cloned);
    }
    else {
        accumulator.push(cloned);
    }
}
/**
 * Main unwind function which takes an array and a field to unwind.
 */
function unwind(array, field) {
    const result = [];
    array.forEach((item) => {
        unwindItem(result, item, field);
    });
    return result;
}
exports.unwind = unwind;
/**
 * Checks whether value can be converted to a number
 */
function isNumber(value) {
    return !isNaN(Number(value));
}
exports.isNumber = isNumber;
/*
 * Helper functions which were created to remove underscorejs from this package.
 */
function isString(value) {
    return typeof value === 'string';
}
exports.isString = isString;
function isObject(value) {
    return typeof value === 'object';
}
exports.isObject = isObject;
function isNull(value) {
    return value === null;
}
exports.isNull = isNull;
function isUndefined(value) {
    return typeof value === 'undefined';
}
exports.isUndefined = isUndefined;
function isError(value) {
    // TODO(mrodrig): test this possible change
    // return value instanceof Error;
    return Object.prototype.toString.call(value) === '[object Error]';
}
exports.isError = isError;
function arrayDifference(a, b) {
    return a.filter((x) => !b.includes(x));
}
exports.arrayDifference = arrayDifference;
function unique(array) {
    return [...new Set(array)];
}
exports.unique = unique;
function flatten(array) {
    // Node 11+ - use the native array flattening function
    if (array.flat) {
        return array.flat();
    }
    // #167 - allow browsers to flatten very long 200k+ element arrays
    if (array.length > MAX_ARRAY_LENGTH) {
        let safeArray = [];
        for (let a = 0; a < array.length; a += MAX_ARRAY_LENGTH) {
            safeArray = safeArray.concat(...array.slice(a, a + MAX_ARRAY_LENGTH));
        }
        return safeArray;
    }
    return array.reduce((accumulator, value) => accumulator.concat(value), []);
}
exports.flatten = flatten;
/**
 * Used to help avoid incorrect values returned by JSON.parse when converting
 * CSV back to JSON, such as '39e1804' which JSON.parse converts to Infinity
 */
function isInvalid(parsedJson) {
    return parsedJson === Infinity ||
        parsedJson === -Infinity;
}
exports.isInvalid = isInvalid;
