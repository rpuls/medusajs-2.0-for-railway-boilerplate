"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToSelectRelationObject = stringToSelectRelationObject;
/**
 * Convert a string fields array to a specific object such as { select, relation }
 * @param fields
 *
 * @example
 * const fields = [
 *   "id",
 *   "created_at",
 *   "updated_at",
 *   "deleted_at",
 *   "url",
 *   "metadata",
 *   "tags.id",
 *   "tags.created_at",
 *   "tags.updated_at",
 *   "tags.deleted_at",
 *   "tags.value",
 *   "options.id",
 *   "options.created_at",
 *   "options.updated_at",
 *   "options.deleted_at",
 *   "options.title",
 *   "options.product_id",
 *   "options.metadata",
 *   "options.values.id",
 *   "options.values.created_at",
 *   "options.values.updated_at",
 *   "options.values.deleted_at",
 *   "options.values.value",
 *   "options.values.option_id",
 *   "options.values.variant_id",
 *   "options.values.metadata",
 * ]
 *
 * const remoteQueryObject = stringToSelectRelationObject(fields)
 *
 * console.log(remoteQueryObject)
 * // {
 * //   select: [
 * //     "id",
 * //     "created_at",
 * //     "updated_at",
 * //     "deleted_at",
 * //     "url",
 * //     "metadata",
 * //     "tags.id",
 * //     "tags.created_at",
 * //     "tags.updated_at",
 * //     "tags.deleted_at",
 * //     "tags.value",
 * //     "options.id",
 * //     "options.created_at",
 * //     "options.updated_at",
 * //     "options.deleted_at",
 * //     "options.title",
 * //     "options.product_id",
 * //     "options.metadata",
 * //     "options.values.id",
 * //     "options.values.created_at",
 * //     "options.values.updated_at",
 * //     "options.values.deleted_at",
 * //     "options.values.value",
 * //     "options.values.option_id",
 * //     "options.values.variant_id",
 * //     "options.values.metadata",
 * //   ],
 * //   relations: ["tags", "options", "options.values"],
 * // }
 */
function stringToSelectRelationObject(fields) {
    const tempResult = {
        select: new Set(),
        relations: new Set(),
    };
    for (const field of fields) {
        tempResult.select.add(field);
        if (!field.includes(".")) {
            continue;
        }
        const segments = field.split(".");
        segments.pop();
        const relationPath = segments.join(".");
        tempResult.relations.add(relationPath);
    }
    return {
        select: Array.from(tempResult.select),
        relations: Array.from(tempResult.relations),
    };
}
//# sourceMappingURL=string-to-select-relation-object.js.map