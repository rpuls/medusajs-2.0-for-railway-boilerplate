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
export declare function mergeMetadata(metadata: Record<string, any>, metadataToMerge: Record<string, any>): {
    [x: string]: any;
};
//# sourceMappingURL=merge-metadata.d.ts.map