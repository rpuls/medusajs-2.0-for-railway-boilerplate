"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDateComparisonOperator = void 0;
function isDateComparisonOperator(value) {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const validOperators = ["$gte", "$lte", "$gt", "$lt"];
    const hasAtLeastOneOperator = validOperators.some((op) => op in value);
    const allPropertiesValid = Object.entries(value)
        .every(([key, val]) => validOperators.includes(key) && (typeof val === "string" || val === undefined));
    return hasAtLeastOneOperator && allPropertiesValid;
}
exports.isDateComparisonOperator = isDateComparisonOperator;
//# sourceMappingURL=is-date-comparison-operator.js.map