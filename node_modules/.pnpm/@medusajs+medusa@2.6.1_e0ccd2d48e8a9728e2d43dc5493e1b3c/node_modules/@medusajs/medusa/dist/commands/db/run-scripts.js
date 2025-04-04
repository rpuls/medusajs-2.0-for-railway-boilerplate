"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrationScripts = runMigrationScripts;
const framework_1 = require("@medusajs/framework");
const links_1 = require("@medusajs/framework/links");
const logger_1 = require("@medusajs/framework/logger");
const migrations_1 = require("@medusajs/framework/migrations");
const utils_1 = require("@medusajs/framework/utils");
const path_1 = require("path");
const modules_sdk_1 = require("@medusajs/framework/modules-sdk");
const loaders_1 = require("../../loaders");
const resolve_plugins_1 = require("../../loaders/helpers/resolve-plugins");
const utils_2 = require("../utils");
const TERMINAL_SIZE = process.stdout.columns;
/**
 * A low-level utility to migrate the migration scripts. This util should
 * never exit the process implicitly.
 */
async function runMigrationScripts({ directory, }) {
    let onApplicationPrepareShutdown = async () => Promise.resolve();
    let onApplicationShutdown = async () => Promise.resolve();
    let container_;
    let plugins;
    try {
        container_ = await (0, loaders_1.initializeContainer)(directory);
        await (0, utils_2.ensureDbExists)(container_);
        const configModule = container_.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
        plugins = await (0, resolve_plugins_1.getResolvedPlugins)(directory, configModule, true);
        (0, utils_1.mergePluginModules)(configModule, plugins);
        const resources = await loadResources(plugins);
        onApplicationPrepareShutdown = resources.onApplicationPrepareShutdown;
        onApplicationShutdown = resources.onApplicationShutdown;
        const scriptsSourcePaths = [
            (0, path_1.join)((0, path_1.dirname)(require.resolve("@medusajs/medusa")), "migration-scripts"),
            ...plugins.map((plugin) => (0, path_1.join)(plugin.resolve, "migration-scripts")),
        ];
        const migrator = new migrations_1.MigrationScriptsMigrator({ container: container_ });
        await migrator.ensureMigrationsTable();
        const pendingScripts = await migrator.getPendingMigrations(scriptsSourcePaths);
        if (!pendingScripts?.length) {
            logger_1.logger.info("No pending migration scripts to execute");
            return true;
        }
        console.log(new Array(TERMINAL_SIZE).join("-"));
        logger_1.logger.info("Pending migration scripts to execute");
        logger_1.logger.info(`${pendingScripts.join("\n")}`);
        console.log(new Array(TERMINAL_SIZE).join("-"));
        logger_1.logger.info("Running migration scripts...");
        await migrator.run(scriptsSourcePaths);
        console.log(new Array(TERMINAL_SIZE).join("-"));
        logger_1.logger.info("Migration scripts completed");
        return true;
    }
    finally {
        await onApplicationPrepareShutdown();
        await onApplicationShutdown();
    }
}
async function loadResources(plugins) {
    /**
     * Clear all module instances to prevent cache from kicking in
     */
    modules_sdk_1.MedusaModule.clearInstances();
    /**
     * Setup
     */
    const linksSourcePaths = plugins.map((plugin) => (0, path_1.join)(plugin.resolve, "links"));
    await new links_1.LinkLoader(linksSourcePaths).load();
    const medusaAppResources = await new framework_1.MedusaAppLoader().load();
    const onApplicationPrepareShutdown = medusaAppResources.onApplicationPrepareShutdown;
    const onApplicationShutdown = medusaAppResources.onApplicationShutdown;
    await medusaAppResources.onApplicationStart();
    return {
        onApplicationPrepareShutdown,
        onApplicationShutdown,
    };
}
const main = async function ({ directory, }) {
    try {
        const migrated = await runMigrationScripts({
            directory,
        });
        process.exit(migrated ? 0 : 1);
    }
    catch (error) {
        logger_1.logger.error(error);
        process.exit(1);
    }
};
exports.default = main;
//# sourceMappingURL=run-scripts.js.map