'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDocumentToRecurOn = exports.flatten = exports.unique = void 0;
function unique(array) {
    return [...new Set(array)];
}
exports.unique = unique;
function flatten(array) {
    return [].concat(...array);
}
exports.flatten = flatten;
/**
 * Returns whether this value is a document to recur on or not
 * @param val Any item whose type will be evaluated
 * @returns {boolean}
 */
function isDocumentToRecurOn(val) {
    return typeof val === 'object' && val !== null && !Array.isArray(val) && Object.keys(val).length;
}
exports.isDocumentToRecurOn = isDocumentToRecurOn;
