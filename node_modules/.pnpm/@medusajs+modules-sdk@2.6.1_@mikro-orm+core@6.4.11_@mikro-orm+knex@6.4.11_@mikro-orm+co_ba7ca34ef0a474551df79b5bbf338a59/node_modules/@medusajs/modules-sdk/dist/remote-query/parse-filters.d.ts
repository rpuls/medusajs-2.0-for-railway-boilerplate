/**
 * Parse and assign filters to remote query object to the corresponding relation level
 * @param entryPoint
 * @param filters
 * @param remoteQueryObject
 * @param isFieldAliasNestedRelation
 * @param entitiesMap
 */
export declare function parseAndAssignFilters({ entryPoint, filters, remoteQueryObject, isFieldAliasNestedRelation, }: {
    remoteQueryObject: object;
    entryPoint: string;
    filters: object;
    isFieldAliasNestedRelation?: boolean;
}, entitiesMap: Map<string, any>): void;
//# sourceMappingURL=parse-filters.d.ts.map