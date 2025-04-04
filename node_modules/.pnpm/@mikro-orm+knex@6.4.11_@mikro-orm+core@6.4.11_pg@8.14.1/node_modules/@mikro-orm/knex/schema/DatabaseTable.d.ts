import { type Configuration, type DeferMode, type Dictionary, type EntityMetadata, type EntityProperty, type NamingStrategy } from '@mikro-orm/core';
import type { SchemaHelper } from './SchemaHelper';
import type { CheckDef, Column, ForeignKey, IndexDef } from '../typings';
import type { AbstractSqlPlatform } from '../AbstractSqlPlatform';
/**
 * @internal
 */
export declare class DatabaseTable {
    private readonly platform;
    readonly name: string;
    readonly schema?: string | undefined;
    private columns;
    private indexes;
    private checks;
    private foreignKeys;
    nativeEnums: Dictionary<{
        name: string;
        schema?: string;
        items: string[];
    }>;
    comment?: string;
    constructor(platform: AbstractSqlPlatform, name: string, schema?: string | undefined);
    getColumns(): Column[];
    getColumn(name: string): Column | undefined;
    removeColumn(name: string): void;
    getIndexes(): IndexDef[];
    getChecks(): CheckDef[];
    init(cols: Column[], indexes: IndexDef[] | undefined, checks: CheckDef[] | undefined, pks: string[], fks?: Dictionary<ForeignKey>, enums?: Dictionary<string[]>): void;
    addColumn(column: Column): void;
    addColumnFromProperty(prop: EntityProperty, meta: EntityMetadata, config: Configuration): void;
    private getIndexName;
    getEntityDeclaration(namingStrategy: NamingStrategy, schemaHelper: SchemaHelper, scalarPropertiesForRelations: 'always' | 'never' | 'smart'): EntityMetadata;
    private foreignKeysToProps;
    private findFkIndex;
    private getIndexProperties;
    private getSafeBaseNameForFkProp;
    /**
     * The shortest name is stripped of the default namespace. All other namespaced elements are returned as full-qualified names.
     */
    getShortestName(): string;
    getForeignKeys(): Dictionary<ForeignKey>;
    hasColumn(columnName: string): boolean;
    getIndex(indexName: string): IndexDef | undefined;
    hasIndex(indexName: string): boolean;
    getCheck(checkName: string): CheckDef<unknown> | undefined;
    hasCheck(checkName: string): boolean;
    getPrimaryKey(): IndexDef | undefined;
    hasPrimaryKey(): boolean;
    private getForeignKeyDeclaration;
    private getPropertyDeclaration;
    private getReferenceKind;
    private getPropertyName;
    private getPropertyTypeForForeignKey;
    private getPropertyTypeForColumn;
    private getPropertyDefaultValue;
    addIndex(meta: EntityMetadata, index: {
        properties: string | string[];
        name?: string;
        type?: string;
        expression?: string;
        deferMode?: DeferMode;
        options?: Dictionary;
    }, type: 'index' | 'unique' | 'primary'): void;
    addCheck(check: CheckDef): void;
    toJSON(): Dictionary;
}
