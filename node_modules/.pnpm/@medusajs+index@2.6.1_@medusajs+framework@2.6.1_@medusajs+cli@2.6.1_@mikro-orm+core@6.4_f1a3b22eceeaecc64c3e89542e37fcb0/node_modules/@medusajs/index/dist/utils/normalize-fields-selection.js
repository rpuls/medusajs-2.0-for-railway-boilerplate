"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeFieldsSelection = normalizeFieldsSelection;
const utils_1 = require("@medusajs/framework/utils");
function normalizeFieldsSelection(fields) {
    const normalizedFields = fields.map((field) => field.replace(/\.\*/g, ""));
    const fieldsObject = (0, utils_1.objectFromStringPath)(normalizedFields);
    return fieldsObject;
}
//# sourceMappingURL=normalize-fields-selection.js.map