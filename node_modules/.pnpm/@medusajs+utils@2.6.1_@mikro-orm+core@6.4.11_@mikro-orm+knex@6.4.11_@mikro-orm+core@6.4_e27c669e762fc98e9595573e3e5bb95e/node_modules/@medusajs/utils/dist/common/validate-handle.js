"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidHandle = void 0;
/**
 * Helper method to validate entity "handle" to be URL
 * friendly.
 */
const isValidHandle = (value) => {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
};
exports.isValidHandle = isValidHandle;
//# sourceMappingURL=validate-handle.js.map