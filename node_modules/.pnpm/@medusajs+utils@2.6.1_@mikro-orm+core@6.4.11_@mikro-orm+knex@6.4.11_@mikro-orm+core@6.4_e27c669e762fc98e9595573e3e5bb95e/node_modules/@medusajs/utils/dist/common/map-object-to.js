"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapObjectTo = mapObjectTo;
/**
 * Create a new object with the keys remapped and the values picked from the original object based
 * on the map config
 *
 * @param object input object
 * @param mapTo configuration to map the output object
 * @param removeIfNotRemapped if true, the keys that are not remapped will be removed from the output object
 * @param pick if provided, only the keys in the array will be picked from the output object
 */
function mapObjectTo(object, mapTo, { removeIfNotRemapped, pick, } = {}) {
    removeIfNotRemapped ??= false;
    const newObject = {};
    for (const key in object) {
        const remapConfig = mapTo[key];
        if (!remapConfig) {
            if (!removeIfNotRemapped) {
                newObject[key] = object[key];
            }
            continue;
        }
        remapConfig.forEach((config) => {
            if (pick?.length && !pick.includes(config.mapTo)) {
                return;
            }
            newObject[config.mapTo] = object[key]
                .map((obj) => obj[config.valueFrom])
                .filter(Boolean);
        });
    }
    return newObject;
}
//# sourceMappingURL=map-object-to.js.map