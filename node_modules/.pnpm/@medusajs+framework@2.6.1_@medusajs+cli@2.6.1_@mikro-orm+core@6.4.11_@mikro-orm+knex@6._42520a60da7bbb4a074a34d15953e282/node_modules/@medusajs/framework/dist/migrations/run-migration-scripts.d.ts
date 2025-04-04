import { MedusaContainer } from "@medusajs/types";
import { Migrator } from "./migrator";
export declare class MigrationScriptsMigrator extends Migrator {
    #private;
    protected migration_table_name: string;
    constructor({ container }: {
        container: MedusaContainer;
    });
    /**
     * Run the migration scripts
     * @param paths - The paths from which to load the scripts
     */
    run(paths: string[]): Promise<void>;
    getPendingMigrations(migrationPaths: string[]): Promise<string[]>;
    protected createMigrationTable(): Promise<void>;
}
//# sourceMappingURL=run-migration-scripts.d.ts.map