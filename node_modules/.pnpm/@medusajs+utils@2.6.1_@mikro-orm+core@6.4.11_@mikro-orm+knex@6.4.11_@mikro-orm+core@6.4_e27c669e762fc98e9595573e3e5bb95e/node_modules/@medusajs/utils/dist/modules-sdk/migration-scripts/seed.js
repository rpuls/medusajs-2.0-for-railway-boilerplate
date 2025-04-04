"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSeedScript = buildSeedScript;
const os_1 = require("os");
const path_1 = require("path");
const dal_1 = require("../../dal");
const load_module_database_config_1 = require("../load-module-database-config");
const common_1 = require("../../common");
/**
 * Utility function to build a seed script that will insert the seed data.
 * @param moduleName
 * @param models
 * @param pathToMigrations
 * @param seedHandler
 */
function buildSeedScript({ moduleName, models, pathToMigrations, seedHandler, }) {
    return async function ({ options, logger, path, }) {
        const logger_ = (logger ?? console);
        logger_.info(`Loading seed data from ${path}...`);
        const dataSeed = await (0, common_1.dynamicImport)((0, path_1.resolve)(process.cwd(), path)).catch((e) => {
            logger_.error(`Failed to load seed data from ${path}. Please, provide a relative path and check that you export the following productCategoriesData, productsData, variantsData.${os_1.EOL}${e}`);
            throw e;
        });
        const dbData = (0, load_module_database_config_1.loadDatabaseConfig)(moduleName, options);
        const entities = Object.values(models);
        const orm = await (0, dal_1.mikroOrmCreateConnection)(dbData, entities, pathToMigrations);
        const manager = orm.em.fork();
        try {
            logger_.info(`Inserting ${moduleName} data...`);
            seedHandler({ manager, logger: logger_, data: dataSeed });
        }
        catch (e) {
            logger_.error(`Failed to insert the seed data in the PostgreSQL database ${dbData.clientUrl}.${os_1.EOL}${e}`);
        }
        await orm.close(true);
    };
}
//# sourceMappingURL=seed.js.map