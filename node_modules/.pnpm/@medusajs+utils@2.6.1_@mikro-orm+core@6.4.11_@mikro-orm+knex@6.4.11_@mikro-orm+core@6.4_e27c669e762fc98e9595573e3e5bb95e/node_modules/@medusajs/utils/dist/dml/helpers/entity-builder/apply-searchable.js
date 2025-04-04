"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySearchable = applySearchable;
const dal_1 = require("../../../dal");
/**
 * Apply the searchable decorator to the property marked as searchable to enable the free text search
 */
function applySearchable(MikroORMEntity, fieldOrRelationship) {
    let propertyName;
    let isSearchable;
    if ("fieldName" in fieldOrRelationship) {
        propertyName = fieldOrRelationship.fieldName;
        isSearchable = !!fieldOrRelationship.dataType.options?.searchable;
    }
    else {
        propertyName = fieldOrRelationship.name;
        isSearchable = fieldOrRelationship.searchable;
    }
    if (!isSearchable) {
        return;
    }
    (0, dal_1.Searchable)()(MikroORMEntity.prototype, propertyName);
}
//# sourceMappingURL=apply-searchable.js.map