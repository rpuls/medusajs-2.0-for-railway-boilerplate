"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRevertMigrationScript = buildRevertMigrationScript;
const dal_1 = require("../../dal");
const load_module_database_config_1 = require("../load-module-database-config");
const migrations_1 = require("../../migrations");
const TERMINAL_SIZE = process.stdout.columns;
/**
 * Utility function to build a migration script that will revert the migrations.
 * Only used in mikro orm based modules.
 * @param moduleName
 * @param pathToMigrations
 */
function buildRevertMigrationScript({ moduleName, pathToMigrations }) {
    /**
     * This script is only valid for mikro orm managers. If a user provide a custom manager
     * he is in charge of reverting the migrations.
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
        migrations.on("reverting", (migration) => {
            logger.info(`  ● Reverting ${migration.name}`);
        });
        migrations.on("reverted", (migration) => {
            logger.info(`  ✔ Reverted ${migration.name}`);
        });
        migrations.on("revert:skipped", (migration) => {
            logger.info(`  ✔ Skipped ${migration.name}. ${migration.reason}`);
        });
        try {
            const result = await migrations.revert();
            if (result.length) {
                logger.info("Reverted successfully");
            }
            else {
                logger.info("Skipped. Nothing to revert");
            }
        }
        catch (error) {
            logger.error(`Failed with error ${error.message}`, error);
        }
    };
}
//# sourceMappingURL=migration-down.js.map