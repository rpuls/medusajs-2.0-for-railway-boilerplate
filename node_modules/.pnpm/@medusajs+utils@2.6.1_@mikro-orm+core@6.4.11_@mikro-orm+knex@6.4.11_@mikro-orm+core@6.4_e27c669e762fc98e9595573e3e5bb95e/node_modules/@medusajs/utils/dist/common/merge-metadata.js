"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeMetadata = mergeMetadata;
/**
 * Merges two metadata objects. The key from the original metadata object is
 * preserved if the key is not present in the metadata to merge. If the key
 * is present in the metadata to merge, the value from the metadata to merge
 * is used. If the key in the metadata to merge is an empty string, the key
 * is removed from the merged metadata object.
 *
 * @param metadata - The base metadata object.
 * @param metadataToMerge - The metadata object to merge.
 * @returns The merged metadata object.
 */
function mergeMetadata(metadata, metadataToMerge) {
    const merged = { ...metadata };
    for (const [key, value] of Object.entries(metadataToMerge)) {
        if (value === "") {
            delete merged[key];
            continue;
        }
        // NOTE: If we want to handle the same behaviour on nested objects. We should then conside arrays as well.
        // if (value && typeof value === "object") {
        //   merged[key] =
        //     merged[key] && typeof merged[key] === "object"
        //       ? mergeMetadata(merged[key], value)
        //       : { ...value }
        //   continue
        // }
        merged[key] = value;
    }
    return merged;
}
//# sourceMappingURL=merge-metadata.js.map