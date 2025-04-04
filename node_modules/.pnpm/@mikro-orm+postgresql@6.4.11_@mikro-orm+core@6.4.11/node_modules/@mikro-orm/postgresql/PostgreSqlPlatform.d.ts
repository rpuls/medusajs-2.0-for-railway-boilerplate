import { type IPostgresInterval } from 'postgres-interval';
import { type EntityProperty, Type, type SimpleColumnMeta, type Configuration } from '@mikro-orm/core';
import { AbstractSqlPlatform, type IndexDef } from '@mikro-orm/knex';
import { PostgreSqlSchemaHelper } from './PostgreSqlSchemaHelper';
import { PostgreSqlExceptionConverter } from './PostgreSqlExceptionConverter';
export declare class PostgreSqlPlatform extends AbstractSqlPlatform {
    protected readonly schemaHelper: PostgreSqlSchemaHelper;
    protected readonly exceptionConverter: PostgreSqlExceptionConverter;
    setConfig(config: Configuration): void;
    usesReturningStatement(): boolean;
    usesCascadeStatement(): boolean;
    supportsNativeEnums(): boolean;
    supportsCustomPrimaryKeyNames(): boolean;
    getCurrentTimestampSQL(length: number): string;
    getDateTimeTypeDeclarationSQL(column: {
        length?: number;
    }): string;
    getDefaultDateTimeLength(): number;
    convertIntervalToJSValue(value: string): unknown;
    convertIntervalToDatabaseValue(value: IPostgresInterval): unknown;
    getTimeTypeDeclarationSQL(): string;
    getIntegerTypeDeclarationSQL(column: {
        length?: number;
        autoincrement?: boolean;
        generated?: string;
    }): string;
    getBigIntTypeDeclarationSQL(column: {
        autoincrement?: boolean;
    }): string;
    getTinyIntTypeDeclarationSQL(column: {
        length?: number;
        unsigned?: boolean;
        autoincrement?: boolean;
    }): string;
    getUuidTypeDeclarationSQL(column: {
        length?: number;
    }): string;
    getFullTextWhereClause(prop: EntityProperty): string;
    supportsCreatingFullTextIndex(): boolean;
    getFullTextIndexExpression(indexName: string, schemaName: string | undefined, tableName: string, columns: SimpleColumnMeta[]): string;
    normalizeColumnType(type: string, options?: {
        length?: number;
        precision?: number;
        scale?: number;
        autoincrement?: boolean;
    }): string;
    getMappedType(type: string): Type<unknown>;
    getRegExpOperator(val?: unknown, flags?: string): string;
    getRegExpValue(val: RegExp): {
        $re: string;
        $flags?: string;
    };
    isBigIntProperty(prop: EntityProperty): boolean;
    getArrayDeclarationSQL(): string;
    getFloatDeclarationSQL(): string;
    getDoubleDeclarationSQL(): string;
    getEnumTypeDeclarationSQL(column: {
        fieldNames: string[];
        items?: unknown[];
        nativeEnumName?: string;
    }): string;
    supportsMultipleStatements(): boolean;
    marshallArray(values: string[]): string;
    unmarshallArray(value: string): string[];
    getVarcharTypeDeclarationSQL(column: {
        length?: number;
    }): string;
    getCharTypeDeclarationSQL(column: {
        length?: number;
    }): string;
    getIntervalTypeDeclarationSQL(column: {
        length?: number;
    }): string;
    getBlobDeclarationSQL(): string;
    getJsonDeclarationSQL(): string;
    getSearchJsonPropertyKey(path: string[], type: string | undefined | Type, aliased: boolean, value?: unknown): string;
    getJsonIndexDefinition(index: IndexDef): string[];
    quoteIdentifier(id: string, quote?: string): string;
    escape(value: any): string;
    private pad;
    /** @internal */
    formatDate(date: Date): string;
    indexForeignKeys(): boolean;
    getDefaultMappedType(type: string): Type<unknown>;
    supportsSchemas(): boolean;
    getDefaultSchemaName(): string | undefined;
    /**
     * Returns the default name of index for the given columns
     * cannot go past 63 character length for identifiers in MySQL
     */
    getIndexName(tableName: string, columns: string[], type: 'index' | 'unique' | 'foreign' | 'primary' | 'sequence'): string;
    getDefaultPrimaryName(tableName: string, columns: string[]): string;
    /**
     * @inheritDoc
     */
    castColumn(prop?: {
        columnTypes?: string[];
    }): string;
    /**
     * @inheritDoc
     */
    parseDate(value: string | number): Date;
}
