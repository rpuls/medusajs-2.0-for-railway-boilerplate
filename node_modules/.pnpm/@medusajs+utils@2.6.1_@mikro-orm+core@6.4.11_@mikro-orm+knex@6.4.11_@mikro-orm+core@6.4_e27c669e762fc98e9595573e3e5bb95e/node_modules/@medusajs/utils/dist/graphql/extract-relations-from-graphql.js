"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractRelationsFromGQL = extractRelationsFromGQL;
const graphql_1 = require("graphql");
/**
 * Extracts only the relation fields from the GraphQL type map.
 * @param {Map<string, any>} typeMap - The GraphQL schema TypeMap.
 * @returns {Map<string, Map<string, string>>} A map where each key is an entity name, and the values are a map of relation fields and their corresponding entity type.
 */
function extractRelationsFromGQL(typeMap) {
    const relationMap = new Map();
    // Extract the actual type
    const getBaseType = (type) => {
        if ((0, graphql_1.isNonNullType)(type) || (0, graphql_1.isListType)(type)) {
            return getBaseType(type.ofType);
        }
        return type;
    };
    for (const [typeName, graphqlType] of Object.entries(typeMap)) {
        if (!(0, graphql_1.isObjectType)(graphqlType)) {
            continue;
        }
        const fields = graphqlType.getFields();
        const entityRelations = new Map();
        for (const [fieldName, fieldConfig] of Object.entries(fields)) {
            const fieldType = getBaseType(fieldConfig.type);
            // only add relation fields
            if ((0, graphql_1.isObjectType)(fieldType)) {
                entityRelations.set(fieldName, fieldType.name);
            }
        }
        relationMap.set(typeName, entityRelations);
    }
    return relationMap;
}
//# sourceMappingURL=extract-relations-from-graphql.js.map