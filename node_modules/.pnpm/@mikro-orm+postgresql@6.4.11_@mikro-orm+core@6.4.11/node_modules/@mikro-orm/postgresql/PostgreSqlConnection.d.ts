import { AbstractSqlConnection, type Knex } from '@mikro-orm/knex';
export declare class PostgreSqlConnection extends AbstractSqlConnection {
    createKnex(): void;
    getDefaultClientUrl(): string;
    getConnectionOptions(): Knex.PgConnectionConfig;
    protected transformRawResult<T>(res: any, method: 'all' | 'get' | 'run'): T;
}
