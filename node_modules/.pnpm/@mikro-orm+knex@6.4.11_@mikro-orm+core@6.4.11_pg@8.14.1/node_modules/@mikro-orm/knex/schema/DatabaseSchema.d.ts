import { type Configuration, type Dictionary, type EntityMetadata } from '@mikro-orm/core';
import { DatabaseTable } from './DatabaseTable';
import type { AbstractSqlConnection } from '../AbstractSqlConnection';
import type { AbstractSqlPlatform } from '../AbstractSqlPlatform';
/**
 * @internal
 */
export declare class DatabaseSchema {
    private readonly platform;
    readonly name: string;
    private tables;
    private namespaces;
    private nativeEnums;
    constructor(platform: AbstractSqlPlatform, name: string);
    addTable(name: string, schema: string | undefined | null, comment?: string): DatabaseTable;
    getTables(): DatabaseTable[];
    getTable(name: string): DatabaseTable | undefined;
    hasTable(name: string): boolean;
    setNativeEnums(nativeEnums: Dictionary<{
        name: string;
        schema?: string;
        items: string[];
    }>): void;
    getNativeEnums(): Dictionary<{
        name: string;
        schema?: string;
        items: string[];
    }>;
    getNativeEnum(name: string): {
        name: string;
        schema?: string;
        items: string[];
    };
    hasNamespace(namespace: string): boolean;
    hasNativeEnum(name: string): boolean;
    getNamespaces(): string[];
    static create(connection: AbstractSqlConnection, platform: AbstractSqlPlatform, config: Configuration, schemaName?: string, schemas?: string[], takeTables?: (string | RegExp)[], skipTables?: (string | RegExp)[]): Promise<DatabaseSchema>;
    static fromMetadata(metadata: EntityMetadata[], platform: AbstractSqlPlatform, config: Configuration, schemaName?: string): DatabaseSchema;
    private static getSchemaName;
    private static matchName;
    private static isTableNameAllowed;
    private static shouldHaveColumn;
    toJSON(): Dictionary;
    prune(schema: string | undefined, wildcardSchemaTables: string[]): void;
}
