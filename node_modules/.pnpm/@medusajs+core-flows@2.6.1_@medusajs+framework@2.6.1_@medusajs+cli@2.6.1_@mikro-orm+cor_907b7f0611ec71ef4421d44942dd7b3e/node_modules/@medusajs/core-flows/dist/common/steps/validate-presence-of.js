"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePresenceOfStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
/**
 * This step validates the presence of attributes on an object
 */
exports.validatePresenceOfStep = (0, workflows_sdk_1.createStep)("validate-presence-of", async function ({ entity, fields, }) {
    const invalid = [];
    for (const field of fields) {
        if (!(0, utils_1.isPresent)(entity[field])) {
            invalid.push(field);
        }
    }
    if (invalid.length) {
        const invalidFields = invalid.join(", ");
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Field(s) are required to have value to continue - ${invalidFields}`);
    }
});
//# sourceMappingURL=validate-presence-of.js.map