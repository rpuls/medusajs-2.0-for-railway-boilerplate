"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildGenerateMigrationScript = buildGenerateMigrationScript;
const dal_1 = require("../../dal");
const load_module_database_config_1 = require("../load-module-database-config");
const migrations_1 = require("../../migrations");
const dml_1 = require("../../dml");
const TERMINAL_SIZE = process.stdout.columns;
/**
 * Utility function to build a migration generation script that will generate the migrations.
 * Only used in mikro orm based modules.
 * @param moduleName
 * @param models
 * @param pathToMigrations
 */
function buildGenerateMigrationScript({ moduleName, models, pathToMigrations, }) {
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
        const normalizedModels = (0, dml_1.toMikroOrmEntities)(models);
        const orm = await (0, dal_1.mikroOrmCreateConnection)(dbData, normalizedModels, pathToMigrations);
        const migrations = new migrations_1.Migrations(orm);
        try {
            const { fileName } = await migrations.generate();
            if (fileName) {
                logger.info(`Generated successfully (${fileName}).`);
            }
            else {
                logger.info(`Skipped. No changes detected in your models.`);
            }
        }
        catch (error) {
            logger.error(`Failed with error ${error.message}`, error);
        }
    };
}
//# sourceMappingURL=migration-generate.js.map