import { MonkeyPatchable } from '../../MonkeyPatchable';
export declare class LibSqlKnexDialect extends MonkeyPatchable.BetterSqlite3Dialect {
    get driverName(): string;
    _driver(): any;
    _query(this: any, connection: any, obj: any): Promise<any>;
    acquireRawConnection(this: any): Promise<any>;
    tableCompiler(): any;
    validateConnection(connection: any): boolean;
    private getCallMethod;
    private isRunQuery;
}
