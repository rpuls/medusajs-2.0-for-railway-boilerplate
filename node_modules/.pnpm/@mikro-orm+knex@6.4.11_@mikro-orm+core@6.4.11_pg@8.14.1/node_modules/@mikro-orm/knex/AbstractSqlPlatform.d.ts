import { Platform, type Constructor, type EntityManager, type EntityRepository, type IDatabaseDriver, type MikroORM } from '@mikro-orm/core';
import { SqlSchemaGenerator, type SchemaHelper } from './schema';
import type { IndexDef } from './typings';
export declare abstract class AbstractSqlPlatform extends Platform {
    protected readonly schemaHelper?: SchemaHelper;
    usesPivotTable(): boolean;
    indexForeignKeys(): boolean;
    getRepositoryClass<T extends object>(): Constructor<EntityRepository<T>>;
    getSchemaHelper(): SchemaHelper | undefined;
    /** @inheritDoc */
    lookupExtensions(orm: MikroORM): void;
    getSchemaGenerator(driver: IDatabaseDriver, em?: EntityManager): SqlSchemaGenerator;
    quoteValue(value: any): string;
    escape(value: any): string;
    getSearchJsonPropertySQL(path: string, type: string, aliased: boolean): string;
    getSearchJsonPropertyKey(path: string[], type: string, aliased: boolean, value?: unknown): string;
    getJsonIndexDefinition(index: IndexDef): string[];
    isRaw(value: any): boolean;
    supportsSchemas(): boolean;
    /** @inheritDoc */
    generateCustomOrder(escapedColumn: string, values: unknown[]): string;
    /**
     * @internal
     */
    getOrderByExpression(column: string, direction: string): string[];
}
