import { type Dictionary } from '@mikro-orm/core';
import { SchemaHelper, type AbstractSqlConnection, type CheckDef, type Column, type DatabaseSchema, type DatabaseTable, type ForeignKey, type IndexDef, type Knex, type Table, type TableDifference } from '@mikro-orm/knex';
export declare class PostgreSqlSchemaHelper extends SchemaHelper {
    static readonly DEFAULT_VALUES: {
        'now()': string[];
        'current_timestamp(?)': string[];
        "('now'::text)::timestamp(?) with time zone": string[];
        "('now'::text)::timestamp(?) without time zone": string[];
        'null::character varying': string[];
        'null::timestamp with time zone': string[];
        'null::timestamp without time zone': string[];
    };
    getSchemaBeginning(charset: string, disableForeignKeys?: boolean): string;
    getCreateDatabaseSQL(name: string): string;
    getListTablesSQL(): string;
    getNamespaces(connection: AbstractSqlConnection): Promise<string[]>;
    private getIgnoredNamespacesConditionSQL;
    loadInformationSchema(schema: DatabaseSchema, connection: AbstractSqlConnection, tables: Table[], schemas?: string[]): Promise<void>;
    getAllIndexes(connection: AbstractSqlConnection, tables: Table[]): Promise<Dictionary<IndexDef[]>>;
    getAllColumns(connection: AbstractSqlConnection, tablesBySchemas: Map<string | undefined, Table[]>, nativeEnums?: Dictionary<{
        name: string;
        schema?: string;
        items: string[];
    }>): Promise<Dictionary<Column[]>>;
    getAllChecks(connection: AbstractSqlConnection, tablesBySchemas: Map<string | undefined, Table[]>): Promise<Dictionary<CheckDef[]>>;
    getAllForeignKeys(connection: AbstractSqlConnection, tablesBySchemas: Map<string | undefined, Table[]>): Promise<Dictionary<Dictionary<ForeignKey>>>;
    getNativeEnumDefinitions(connection: AbstractSqlConnection, schemas: string[]): Promise<Dictionary<{
        name: string;
        schema?: string;
        items: string[];
    }>>;
    getCreateNativeEnumSQL(name: string, values: unknown[], schema?: string): string;
    getDropNativeEnumSQL(name: string, schema?: string): string;
    getAlterNativeEnumSQL(name: string, schema?: string, value?: string, items?: string[], oldItems?: string[]): string;
    getEnumDefinitions(connection: AbstractSqlConnection, checks: CheckDef[], tableName?: string, schemaName?: string): Promise<Dictionary<string[]>>;
    createTableColumn(table: Knex.TableBuilder, column: Column, fromTable: DatabaseTable, changedProperties?: Set<string>, alter?: boolean): Knex.ColumnBuilder | undefined;
    configureColumn(column: Column, col: Knex.ColumnBuilder, knex: Knex, changedProperties?: Set<string>): Knex.ColumnBuilder;
    getPreAlterTable(tableDiff: TableDifference, safe: boolean): string;
    getPostAlterTable(tableDiff: TableDifference, safe: boolean): string;
    getAlterColumnAutoincrement(tableName: string, column: Column, schemaName?: string): string;
    getChangeColumnCommentSQL(tableName: string, to: Column, schemaName?: string): string;
    normalizeDefaultValue(defaultValue: string, length: number): string | number;
    getDatabaseExistsSQL(name: string): string;
    getDatabaseNotExistsError(dbName: string): string;
    getManagementDbName(): string;
    disableForeignKeysSQL(): string;
    enableForeignKeysSQL(): string;
    getRenameIndexSQL(tableName: string, index: IndexDef, oldIndexName: string): string;
    private getIndexesSQL;
    private getChecksSQL;
    getChecks(connection: AbstractSqlConnection, tableName: string, schemaName: string, columns?: Column[]): Promise<CheckDef[]>;
    getColumns(connection: AbstractSqlConnection, tableName: string, schemaName?: string): Promise<Column[]>;
    getIndexes(connection: AbstractSqlConnection, tableName: string, schemaName?: string): Promise<IndexDef[]>;
    inferLengthFromColumnType(type: string): number | undefined;
}
