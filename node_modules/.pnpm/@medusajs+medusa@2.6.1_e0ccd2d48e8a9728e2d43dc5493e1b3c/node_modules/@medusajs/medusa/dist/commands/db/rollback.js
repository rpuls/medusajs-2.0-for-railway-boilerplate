"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const utils_1 = require("@medusajs/framework/utils");
const links_1 = require("@medusajs/framework/links");
const logger_1 = require("@medusajs/framework/logger");
const framework_1 = require("@medusajs/framework");
const utils_2 = require("../utils");
const loaders_1 = require("../../loaders");
const resolve_plugins_1 = require("../../loaders/helpers/resolve-plugins");
const TERMINAL_SIZE = process.stdout.columns;
const main = async function ({ directory, modules }) {
    try {
        /**
         * Setup
         */
        const container = await (0, loaders_1.initializeContainer)(directory);
        await (0, utils_2.ensureDbExists)(container);
        const medusaAppLoader = new framework_1.MedusaAppLoader();
        const configModule = container.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
        const plugins = await (0, resolve_plugins_1.getResolvedPlugins)(directory, configModule, true);
        (0, utils_1.mergePluginModules)(configModule, plugins);
        const linksSourcePaths = plugins.map((plugin) => (0, path_1.join)(plugin.resolve, "links"));
        await new links_1.LinkLoader(linksSourcePaths).load();
        /**
         * Reverting migrations
         */
        logger_1.logger.info("Reverting migrations...");
        await medusaAppLoader.runModulesMigrations({
            moduleNames: modules,
            action: "revert",
        });
        console.log(new Array(TERMINAL_SIZE).join("-"));
        logger_1.logger.info("Migrations reverted");
        process.exit();
    }
    catch (error) {
        console.log(new Array(TERMINAL_SIZE).join("-"));
        if (error.code && error.code === utils_1.MedusaError.Codes.UNKNOWN_MODULES) {
            logger_1.logger.error(error.message);
            const modulesList = error.allModules.map((name) => `          - ${name}`);
            logger_1.logger.error(`Available modules:\n${modulesList.join("\n")}`);
        }
        else {
            logger_1.logger.error(error.message, error);
        }
        process.exit(1);
    }
};
exports.default = main;
//# sourceMappingURL=rollback.js.map