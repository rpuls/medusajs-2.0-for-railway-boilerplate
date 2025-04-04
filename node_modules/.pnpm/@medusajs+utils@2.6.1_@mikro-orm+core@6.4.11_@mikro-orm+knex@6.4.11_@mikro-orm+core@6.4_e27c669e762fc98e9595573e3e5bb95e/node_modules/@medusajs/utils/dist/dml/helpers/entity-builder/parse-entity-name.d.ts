import { DmlEntity } from "../../entity";
/**
 * Parses entity name and returns model and table name from
 * it
 */
export declare function parseEntityName(entity: DmlEntity<any, any>): {
    tableName: any;
    modelName: string;
    pgSchema: any;
    tableNameWithoutSchema: any;
};
//# sourceMappingURL=parse-entity-name.d.ts.map