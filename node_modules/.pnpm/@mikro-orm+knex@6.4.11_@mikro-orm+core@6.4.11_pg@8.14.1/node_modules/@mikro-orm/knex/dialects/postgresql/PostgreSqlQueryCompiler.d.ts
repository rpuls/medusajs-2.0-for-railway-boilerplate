import { MonkeyPatchable } from '../../MonkeyPatchable';
export declare class PostgreSqlQueryCompiler extends MonkeyPatchable.PostgresQueryCompiler {
    _lockingClause(this: any, lockMode: string): string;
}
