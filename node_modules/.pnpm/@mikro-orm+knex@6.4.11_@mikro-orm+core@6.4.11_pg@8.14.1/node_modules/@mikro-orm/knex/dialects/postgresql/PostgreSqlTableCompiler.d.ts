import PostgresDialectTableCompiler from 'knex/lib/dialects/postgres/schema/pg-tablecompiler';
import type { Configuration, Dictionary } from '@mikro-orm/core';
export declare class PostgreSqlTableCompiler extends PostgresDialectTableCompiler {
    ormConfig: Configuration;
    alterColumnsPrefix: string;
    addColumns(columns: Dictionary[], prefix: string, colCompilers: Dictionary[]): any;
    private addColumn;
    private alterColumnNullable;
    private addColumnDefault;
    private dropColumnDefault;
}
