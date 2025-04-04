"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configManager = void 0;
exports.configLoader = configLoader;
const utils_1 = require("@medusajs/utils");
const logger_1 = require("../logger");
const config_1 = require("./config");
const container_1 = require("../container");
const awilix_1 = require("awilix");
const handleConfigError = (error) => {
    logger_1.logger.error(`Error in loading config: ${error.message}`);
    if (error.stack) {
        logger_1.logger.error(error.stack);
    }
    process.exit(1);
};
exports.configManager = new config_1.ConfigManager();
container_1.container.register(utils_1.ContainerRegistrationKeys.CONFIG_MODULE, (0, awilix_1.asFunction)(() => exports.configManager.config));
/**
 * Loads the config file and returns the config module after validating, normalizing the configurations
 *
 * @param entryDirectory The directory to find the config file from
 * @param configFileName The name of the config file to search for in the entry directory
 */
async function configLoader(entryDirectory, configFileName) {
    const config = await (0, utils_1.getConfigFile)(entryDirectory, configFileName);
    if (config.error) {
        handleConfigError(config.error);
    }
    return exports.configManager.loadConfig({
        projectConfig: config.configModule,
        baseDir: entryDirectory,
    });
}
//# sourceMappingURL=loader.js.map