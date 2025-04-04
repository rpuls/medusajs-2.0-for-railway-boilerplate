import { DmlEntity } from "../entity";
export declare function generateGraphQLFromEntity<T extends DmlEntity<any, any>>(entity: T): string;
/**
 * Takes a DML entity and returns a GraphQL schema string.
 * @param entity
 */
export declare const toGraphQLSchema: <T extends any[]>(entities: T) => string;
//# sourceMappingURL=create-graphql.d.ts.map