"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMetadata = setMetadata;
const errors_1 = require("./errors");
/**
 * Dedicated method to set metadata.
 * @param obj - the entity to apply metadata to.
 * @param metadata - the metadata to set
 * @return resolves to the updated result.
 */
function setMetadata(obj, metadata) {
    const existing = obj.metadata || {};
    const newData = {};
    for (const [key, value] of Object.entries(metadata)) {
        if (typeof key !== "string") {
            throw new errors_1.MedusaError(errors_1.MedusaError.Types.INVALID_ARGUMENT, "Key type is invalid. Metadata keys must be strings");
        }
        /**
         * We reserve the empty string as a way to delete a key.
         * If the value is an empty string, we don't
         * set it, and if it exists in the existing metadata, we
         * unset the field.
         */
        if (value === "") {
            if (key in existing) {
                delete existing[key];
            }
            continue;
        }
        newData[key] = value;
    }
    return {
        ...existing,
        ...newData,
    };
}
//# sourceMappingURL=set-metadata.js.map