"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEntityName = parseEntityName;
const common_1 = require("../../../common");
/**
 * Parses entity name and returns model and table name from
 * it
 */
function parseEntityName(entity) {
    const parsedEntity = entity.parse();
    /**
     * Table name is going to be the snake case version of the entity name.
     * Here we should preserve PG schema (if defined).
     *
     * For example: "platform.user" should stay as "platform.user"
     */
    const tableName = (0, common_1.camelToSnakeCase)(parsedEntity.tableName);
    /**
     * Entity name is going to be the camelCase version of the
     * name defined by the user
     */
    const [pgSchema, ...rest] = tableName.split(".");
    return {
        tableName,
        modelName: (0, common_1.upperCaseFirst)((0, common_1.toCamelCase)(parsedEntity.name)),
        pgSchema: rest.length ? pgSchema : undefined,
        tableNameWithoutSchema: rest.length ? rest.join(".") : pgSchema,
    };
}
//# sourceMappingURL=parse-entity-name.js.map