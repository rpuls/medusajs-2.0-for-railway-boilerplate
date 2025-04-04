"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWhereQuery = buildWhereQuery;
const common_1 = require("../../../common");
/*
  When creating indexes on the entity, we provide a basic query builder to generate
  the SQL for where query upon the index. Since this is not a full query builder,
  the onus is upon the user to ensure that the SQL is accurately generated.

  Examples:

  { where: { column: null } }
  { where: { column: { $ne: null } } }
  { where: { boolean_column: true } }
  { where: { column: "value", another_column: { $ne: 30 }, boolean_column: true } }
*/
function buildWhereQuery(query) {
    const conditions = [];
    for (const [key, value] of Object.entries(query)) {
        if (!(0, common_1.isDefined)(value)) {
            throw new Error(`value cannot be undefined when building where query for an index`);
        }
        if (isQueryCondition(value)) {
            conditions.push(buildWhereQuery(value));
        }
        else {
            conditions.push(buildCondition(key, value));
        }
    }
    return conditions.filter((condition) => condition?.length).join(" AND ");
}
function isQueryCondition(value) {
    return (0, common_1.isObject)(value) && value !== null && !("$ne" in value);
}
function buildCondition(key, value) {
    if (value === null) {
        return `${key} IS NULL`;
    }
    else if ((0, common_1.isObject)(value) && "$ne" in value) {
        if (value.$ne === null) {
            return `${key} IS NOT NULL`;
        }
        else {
            return `${key} != ${formatValue(value.$ne)}`;
        }
    }
    else if ((0, common_1.isBoolean)(value)) {
        return `${key} IS ${formatValue(value)}`;
    }
    else if (!(0, common_1.isDefined)(value)) {
        return "";
    }
    else {
        return `${key} = ${formatValue(value)}`;
    }
}
function formatValue(value) {
    if ((0, common_1.isString)(value)) {
        return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
    }
    if ((0, common_1.isBoolean)(value)) {
        return value ? "TRUE" : "FALSE";
    }
    return String(value);
}
//# sourceMappingURL=query-builder.js.map