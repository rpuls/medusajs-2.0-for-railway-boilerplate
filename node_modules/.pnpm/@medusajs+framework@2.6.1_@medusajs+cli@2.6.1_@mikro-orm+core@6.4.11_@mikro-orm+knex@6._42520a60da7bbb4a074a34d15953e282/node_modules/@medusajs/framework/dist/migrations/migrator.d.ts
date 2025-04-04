import { MedusaContainer } from "@medusajs/types";
import { Knex } from "@mikro-orm/knex";
export declare abstract class Migrator {
    #private;
    protected abstract migration_table_name: string;
    protected container: MedusaContainer;
    protected pgConnection: Knex<any>;
    constructor({ container }: {
        container: MedusaContainer;
    });
    /**
     * Util to track duration using hrtime
     */
    protected trackDuration(): {
        getSeconds(): string;
    };
    ensureDatabase(): Promise<void>;
    ensureMigrationsTable(): Promise<void>;
    getExecutedMigrations(): Promise<{
        script_name: string;
    }[]>;
    insertMigration(records: Record<string, any>[]): Promise<void>;
    /**
     * Load migration files from the given paths
     *
     * @param paths - The paths to load migration files from
     * @param options - The options for loading migration files
     * @param options.force - Whether to force loading migration files even if they have already been loaded
     * @returns The loaded migration file paths
     */
    loadMigrationFiles(paths: string[], { force }?: {
        force?: boolean;
    }): Promise<string[]>;
    protected abstract createMigrationTable(): Promise<void>;
    abstract run(...args: any[]): Promise<any>;
    abstract getPendingMigrations(migrationPaths: string[]): Promise<string[]>;
}
//# sourceMappingURL=migrator.d.ts.map