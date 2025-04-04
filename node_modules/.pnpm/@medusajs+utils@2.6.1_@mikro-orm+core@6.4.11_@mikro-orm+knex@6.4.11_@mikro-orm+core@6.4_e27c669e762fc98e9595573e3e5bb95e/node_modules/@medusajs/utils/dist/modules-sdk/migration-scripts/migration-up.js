"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMigrationScript = buildMigrationScript;
const dal_1 = require("../../dal");
const load_module_database_config_1 = require("../load-module-database-config");
const migrations_1 = require("../../migrations");
const TERMINAL_SIZE = process.stdout.columns;
/**
 * Utility function to build a migration script that will run the migrations.
 * Only used in mikro orm based modules.
 * @param moduleName
 * @param pathToMigrations
 */
function buildMigrationScript({ moduleName, pathToMigrations }) {
    /**
     * This script is only valid for mikro orm managers. If a user provide a custom manager
     * he is in charge of running the migrations.
     * @param options
     * @param logger
     * @param moduleDeclaration
     */
    return async function ({ options, logger, } = {}) {
        logger ??= console;
        console.log(new Array(TERMINAL_SIZE).join("-"));
        console.log("");
        logger.info(`MODULE: ${moduleName}`);
        const dbData = (0, load_module_database_config_1.loadDatabaseConfig)(moduleName, options);
        const orm = await (0, dal_1.mikroOrmCreateConnection)(dbData, [], pathToMigrations);
        const migrations = new migrations_1.Migrations(orm);
        migrations.on("migrating", (migration) => {
            logger.info(`  ● Migrating ${migration.name}`);
        });
        migrations.on("migrated", (migration) => {
            logger.info(`  ✔ Migrated ${migration.name}`);
        });
        try {
            const result = await migrations.run();
            if (result.length) {
                logger.info("Completed successfully");
            }
            else {
                logger.info(`Skipped. Database is up-to-date for module.`);
            }
        }
        catch (error) {
            logger.error(`Failed with error ${error.message}`, error);
        }
    };
}
//# sourceMappingURL=migration-up.js.map