import { MonkeyPatchable } from '../../MonkeyPatchable';
export declare class SqliteKnexDialect extends MonkeyPatchable.Sqlite3Dialect {
    tableCompiler(): any;
    processResponse(obj: any, runner: any): any;
    _query(connection: any, obj: any): Promise<unknown>;
    private getCallMethod;
    private isRunQuery;
}
