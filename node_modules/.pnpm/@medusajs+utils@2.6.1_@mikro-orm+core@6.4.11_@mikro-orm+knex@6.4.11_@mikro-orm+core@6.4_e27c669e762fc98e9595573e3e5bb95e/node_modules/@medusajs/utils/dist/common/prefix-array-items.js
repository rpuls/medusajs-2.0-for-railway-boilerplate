"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prefixArrayItems = prefixArrayItems;
/**
 * Prefixes an array of strings with a specified string
 * @param array
 * @param prefix
 */
function prefixArrayItems(array, prefix) {
    return array.map((arrEl) => `${prefix}${arrEl}`);
}
//# sourceMappingURL=prefix-array-items.js.map