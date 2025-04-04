import { RemoteJoinerQuery } from "@medusajs/types";
/**
 * Remote joiner graphql parser
 */
export declare class GraphQLParser {
    private variables;
    private ast;
    constructor(input: string, variables?: Record<string, unknown>);
    private parseValueNode;
    private parseArguments;
    private parseDirectives;
    private createDirectivesMap;
    private extractEntities;
    parseQuery(): RemoteJoinerQuery;
}
//# sourceMappingURL=graphql-parser.d.ts.map