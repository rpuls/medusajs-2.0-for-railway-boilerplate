"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHandle = void 0;
const to_kebab_case_1 = require("./to-kebab-case");
/**
 * Helper method to create a to be URL friendly "handle" from
 * a string value.
 *
 * - Works by converting the value to lowercase
 * - Splits and remove accents from characters
 * - Removes all unallowed characters like a '"%$ and so on.
 */
const toHandle = (value) => {
    return (0, to_kebab_case_1.kebabCase)(value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""))
        .replace(/[^a-z0-9A-Z-]/g, "")
        .replace(/-{2,}/g, "-");
};
exports.toHandle = toHandle;
//# sourceMappingURL=to-handle.js.map