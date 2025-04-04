"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configLoaderOverride = configLoaderOverride;
const utils_1 = require("@medusajs/framework/utils");
async function configLoaderOverride(entryDirectory, override) {
    const { configManager } = await import("@medusajs/framework/config");
    const { logger } = await import("@medusajs/framework");
    const { configModule, error } = await (0, utils_1.getConfigFile)(entryDirectory, "medusa-config");
    if (error) {
        throw new Error(error.message || "Error during config loading");
    }
    configModule.projectConfig.databaseDriverOptions;
    configModule.projectConfig.databaseUrl = override.clientUrl;
    configModule.projectConfig.databaseLogging = !!override.debug;
    configModule.projectConfig.databaseDriverOptions =
        override.clientUrl.includes("localhost")
            ? {}
            : {
                connection: {
                    ssl: { rejectUnauthorized: false },
                },
                idle_in_transaction_session_timeout: 20000,
            };
    logger.info("Disabling admin as we run integration tests");
    Object.assign(configModule.admin ?? {}, { disable: true });
    configManager.loadConfig({
        projectConfig: configModule,
        baseDir: entryDirectory,
    });
}
//# sourceMappingURL=config.js.map