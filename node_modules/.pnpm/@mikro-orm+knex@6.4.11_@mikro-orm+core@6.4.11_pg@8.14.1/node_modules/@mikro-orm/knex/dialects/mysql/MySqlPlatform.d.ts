import { type SimpleColumnMeta, type Type, type TransformContext } from '@mikro-orm/core';
import { MySqlSchemaHelper } from './MySqlSchemaHelper';
import { MySqlExceptionConverter } from './MySqlExceptionConverter';
import { AbstractSqlPlatform } from '../../AbstractSqlPlatform';
import type { IndexDef } from '../../typings';
export declare class MySqlPlatform extends AbstractSqlPlatform {
    protected readonly schemaHelper: MySqlSchemaHelper;
    protected readonly exceptionConverter: MySqlExceptionConverter;
    protected readonly ORDER_BY_NULLS_TRANSLATE: {
        readonly "asc nulls first": "is not null";
        readonly "asc nulls last": "is null";
        readonly "desc nulls first": "is not null";
        readonly "desc nulls last": "is null";
    };
    getDefaultCharset(): string;
    convertJsonToDatabaseValue(value: unknown, context?: TransformContext): unknown;
    getJsonIndexDefinition(index: IndexDef): string[];
    getBooleanTypeDeclarationSQL(): string;
    normalizeColumnType(type: string, options?: {
        length?: number;
        precision?: number;
        scale?: number;
    }): string;
    getDefaultMappedType(type: string): Type<unknown>;
    isNumericColumn(mappedType: Type<unknown>): boolean;
    supportsUnsigned(): boolean;
    /**
     * Returns the default name of index for the given columns
     * cannot go past 64 character length for identifiers in MySQL
     */
    getIndexName(tableName: string, columns: string[], type: 'index' | 'unique' | 'foreign' | 'primary' | 'sequence'): string;
    getDefaultPrimaryName(tableName: string, columns: string[]): string;
    supportsCreatingFullTextIndex(): boolean;
    getFullTextWhereClause(): string;
    getFullTextIndexExpression(indexName: string, schemaName: string | undefined, tableName: string, columns: SimpleColumnMeta[]): string;
    getOrderByExpression(column: string, direction: string): string[];
}
