import { MikroORM, MikroORMOptions } from "@mikro-orm/core";
import { MigrateOptions, MigrationResult, UmzugMigration } from "@mikro-orm/migrations";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { EventEmitter } from "events";
/**
 * Events emitted by the migrations class
 */
export type MigrationsEvents = {
    migrating: [UmzugMigration];
    migrated: [UmzugMigration];
    reverting: [UmzugMigration];
    reverted: [UmzugMigration];
    "revert:skipped": [UmzugMigration & {
        reason: string;
    }];
};
/**
 * Exposes the API to programmatically manage Mikro ORM migrations
 */
export declare class Migrations extends EventEmitter<MigrationsEvents> {
    #private;
    constructor(configOrConnection: Partial<MikroORMOptions> | MikroORM<PostgreSqlDriver>);
    /**
     * Generates migrations for a collection of entities defined
     * in the config
     */
    generate(): Promise<MigrationResult>;
    /**
     * Run migrations for the provided entities
     */
    run(options?: string | string[] | MigrateOptions): Promise<UmzugMigration[]>;
    /**
     * Run migrations for the provided entities
     */
    revert(options?: string | string[] | MigrateOptions): Promise<UmzugMigration[]>;
    /**
     * Generate a default snapshot file if it does not already exists. This
     * prevent from creating a database to manage the migrations and instead
     * rely on the snapshot.
     *
     * @param snapshotPath
     * @protected
     */
    protected ensureSnapshot(snapshotPath: string): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map