export function isDateComparisonOperator(value) {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const validOperators = ["$gte", "$lte", "$gt", "$lt"];
    const hasAtLeastOneOperator = validOperators.some((op) => op in value);
    const allPropertiesValid = Object.entries(value)
        .every(([key, val]) => validOperators.includes(key) && (typeof val === "string" || val === undefined));
    return hasAtLeastOneOperator && allPropertiesValid;
}
//# sourceMappingURL=is-date-comparison-operator.js.map