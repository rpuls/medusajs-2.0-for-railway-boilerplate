import { GraphQLNamedType } from "graphql";
/**
 * Generate a list of fields and fields relations for a given type with the requested relations
 * @param schemaTypeMap
 * @param typeName
 * @param relations
 */
export declare function gqlGetFieldsAndRelations(schemaTypeMap: {
    [key: string]: GraphQLNamedType;
}, typeName: string, relations?: string[]): string[];
//# sourceMappingURL=get-fields-and-relations.d.ts.map