"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPsqlIndexStatementHelper = createPsqlIndexStatementHelper;
const core_1 = require("@mikro-orm/core");
/**
 * Create a PSQL index statement
 * @param name The name of the index, if not provided it will be generated in the format IDX_tableName_columnName
 * @param tableName The name of the table
 * @param columns The columns to index
 * @param type The type of index (e.g GIN, GIST, BTREE, etc)
 * @param where The where clause
 * @param unique If the index should be a unique index
 *
 * @example
 * createPsqlIndexStatementHelper({
 *   name: "idx_user_email",
 *   tableName: "user",
 *   columns: "email",
 *   type: "btree",
 *   where: "email IS NOT NULL"
 * });
 *
 * // expression:  CREATE INDEX IF NOT EXISTS idx_user_email ON user USING btree (email) WHERE email IS NOT NULL;
 *
 * createPsqlIndexStatementHelper({
 *   name: "idx_user_email",
 *   tableName: "user",
 *   columns: "email"
 * });
 *
 * // expression: CREATE INDEX IF NOT EXISTS idx_user_email ON user (email);
 *
 */
function createPsqlIndexStatementHelper({ name, tableName: qualifiedName, columns, type, where, unique, }) {
    const columnsName = Array.isArray(columns) ? columns.join("_") : columns;
    const tokens = qualifiedName.replace(/"/g, "").split(".");
    let pgSchemaName;
    let tableName;
    let tableReference;
    if (tokens.length > 1) {
        pgSchemaName = tokens.shift();
        tableName = tokens.join(".");
        tableReference = `"${pgSchemaName}"."${tableName}"`;
    }
    else {
        tableName = qualifiedName;
        tableReference = `"${tableName}"`;
    }
    columns = Array.isArray(columns) ? columns.join(", ") : columns;
    name = name || `IDX_${tableName}_${columnsName}${unique ? "_unique" : ""}`;
    const typeStr = type ? ` USING ${type}` : "";
    const optionsStr = where ? ` WHERE ${where}` : "";
    const uniqueStr = unique ? "UNIQUE " : "";
    const expression = `CREATE ${uniqueStr}INDEX IF NOT EXISTS "${name}" ON ${tableReference}${typeStr} (${columns})${optionsStr}`;
    return {
        toString: () => {
            return expression;
        },
        valueOf: () => {
            return expression;
        },
        name,
        expression,
        MikroORMIndex: (options) => {
            return (0, core_1.Index)({
                name,
                expression,
                ...options,
            });
        },
    };
}
//# sourceMappingURL=create-psql-index-helper.js.map