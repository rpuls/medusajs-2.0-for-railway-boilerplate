import type { Connection, Dictionary } from '@mikro-orm/core';
import type { AbstractSqlConnection } from '../../AbstractSqlConnection';
import { SchemaHelper } from '../../schema/SchemaHelper';
import type { CheckDef, Column, IndexDef, TableDifference } from '../../typings';
export declare abstract class BaseSqliteSchemaHelper extends SchemaHelper {
    disableForeignKeysSQL(): string;
    enableForeignKeysSQL(): string;
    supportsSchemaConstraints(): boolean;
    getListTablesSQL(): string;
    getDropDatabaseSQL(name: string): string;
    getDropColumnsSQL(tableName: string, columns: Column[], schemaName?: string): string;
    private parseTableDefinition;
    getColumns(connection: AbstractSqlConnection, tableName: string, schemaName?: string): Promise<any[]>;
    getEnumDefinitions(connection: AbstractSqlConnection, checks: CheckDef[], tableName: string, schemaName: string): Promise<Dictionary<string[]>>;
    getPrimaryKeys(connection: AbstractSqlConnection, indexes: IndexDef[], tableName: string, schemaName?: string): Promise<string[]>;
    getIndexes(connection: AbstractSqlConnection, tableName: string, schemaName?: string): Promise<IndexDef[]>;
    getChecks(connection: AbstractSqlConnection, tableName: string, schemaName?: string): Promise<CheckDef[]>;
    getForeignKeysSQL(tableName: string): string;
    mapForeignKeys(fks: any[], tableName: string): Dictionary;
    getManagementDbName(): string;
    getCreateDatabaseSQL(name: string): string;
    databaseExists(connection: Connection, name: string): Promise<boolean>;
    /**
     * Implicit indexes will be ignored when diffing
     */
    isImplicitIndex(name: string): boolean;
    getAlterTable(changedTable: TableDifference, wrap?: boolean): Promise<string>;
}
