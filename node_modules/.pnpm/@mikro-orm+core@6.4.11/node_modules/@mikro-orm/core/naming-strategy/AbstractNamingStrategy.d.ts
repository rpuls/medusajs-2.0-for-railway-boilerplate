import type { NamingStrategy } from './NamingStrategy';
import { type ReferenceKind } from '../enums';
export declare abstract class AbstractNamingStrategy implements NamingStrategy {
    getClassName(file: string, separator?: string): string;
    classToMigrationName(timestamp: string, customMigrationName?: string): string;
    indexName(tableName: string, columns: string[], type: 'primary' | 'foreign' | 'unique' | 'index' | 'sequence' | 'check'): string;
    /**
     * @inheritDoc
     */
    getEntityName(tableName: string, schemaName?: string): string;
    columnNameToProperty(columnName: string): string;
    /**
     * @inheritDoc
     */
    getEnumClassName(columnName: string, tableName: string, schemaName?: string): string;
    /**
     * @inheritDoc
     */
    enumValueToEnumProperty(enumValue: string, columnName: string, tableName: string, schemaName?: string): string;
    aliasName(entityName: string, index: number): string;
    /**
     * @inheritDoc
     */
    inverseSideName(entityName: string, propertyName: string, kind: ReferenceKind): string;
    abstract classToTableName(entityName: string): string;
    abstract joinColumnName(propertyName: string): string;
    abstract joinKeyColumnName(entityName: string, referencedColumnName?: string): string;
    abstract joinTableName(sourceEntity: string, targetEntity: string, propertyName?: string): string;
    abstract propertyToColumnName(propertyName: string, object?: boolean): string;
    abstract referenceColumnName(): string;
}
