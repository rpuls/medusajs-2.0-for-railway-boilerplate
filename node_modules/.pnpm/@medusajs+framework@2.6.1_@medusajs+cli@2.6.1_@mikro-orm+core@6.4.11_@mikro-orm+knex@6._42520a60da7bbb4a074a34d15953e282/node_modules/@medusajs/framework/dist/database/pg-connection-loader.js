"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pgConnectionLoader = pgConnectionLoader;
const utils_1 = require("@medusajs/utils");
const awilix_1 = require("awilix");
const container_1 = require("../container");
const config_1 = require("../config");
/**
 * Initialize a knex connection that can then be shared to any resources if needed
 */
function pgConnectionLoader() {
    if (container_1.container.hasRegistration(utils_1.ContainerRegistrationKeys.PG_CONNECTION)) {
        return container_1.container.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    }
    const configModule = config_1.configManager.config;
    // Share a knex connection to be consumed by the shared modules
    const connectionString = configModule.projectConfig.databaseUrl;
    const driverOptions = {
        ...(configModule.projectConfig.databaseDriverOptions || {}),
    };
    const schema = configModule.projectConfig.databaseSchema || "public";
    const idleTimeoutMillis = driverOptions.pool?.idleTimeoutMillis ?? undefined; // prevent null to be passed
    const poolMin = driverOptions.pool?.min ?? 2;
    const poolMax = driverOptions.pool?.max;
    const reapIntervalMillis = driverOptions.pool?.reapIntervalMillis ?? undefined;
    const createRetryIntervalMillis = driverOptions.pool?.createRetryIntervalMillis ?? undefined;
    delete driverOptions.pool;
    const pgConnection = utils_1.ModulesSdkUtils.createPgConnection({
        clientUrl: connectionString,
        schema,
        driverOptions,
        pool: {
            min: poolMin,
            max: poolMax,
            idleTimeoutMillis,
            reapIntervalMillis,
            createRetryIntervalMillis,
        },
    });
    container_1.container.register(utils_1.ContainerRegistrationKeys.PG_CONNECTION, (0, awilix_1.asValue)(pgConnection));
    return pgConnection;
}
//# sourceMappingURL=pg-connection-loader.js.map