import type { Knex } from 'knex';
import { AbstractSqlConnection } from '../../AbstractSqlConnection';
export declare abstract class BaseSqliteConnection extends AbstractSqlConnection {
    connect(): Promise<void>;
    getDefaultClientUrl(): string;
    getClientUrl(): string;
    loadFile(path: string): Promise<void>;
    protected getKnexOptions(type: string): Knex.Config;
    protected transformRawResult<T>(res: any, method: 'all' | 'get' | 'run'): T;
}
