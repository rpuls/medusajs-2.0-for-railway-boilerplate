import type { Knex } from 'knex';
import { AbstractSqlConnection } from '../../AbstractSqlConnection';
export declare class MySqlConnection extends AbstractSqlConnection {
    createKnex(): void;
    getDefaultClientUrl(): string;
    getConnectionOptions(): Knex.MySqlConnectionConfig;
    protected transformRawResult<T>(res: any, method: 'all' | 'get' | 'run'): T;
}
