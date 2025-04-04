"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeContainer = initializeContainer;
const framework_1 = require("@medusajs/framework");
const config_1 = require("@medusajs/framework/config");
const database_1 = require("@medusajs/framework/database");
const feature_flags_1 = require("@medusajs/framework/feature-flags");
const http_1 = require("@medusajs/framework/http");
const jobs_1 = require("@medusajs/framework/jobs");
const links_1 = require("@medusajs/framework/links");
const logger_1 = require("@medusajs/framework/logger");
const subscribers_1 = require("@medusajs/framework/subscribers");
const utils_1 = require("@medusajs/framework/utils");
const workflows_1 = require("@medusajs/framework/workflows");
const awilix_1 = require("awilix");
const path_1 = require("path");
const request_ip_1 = __importDefault(require("request-ip"));
const uuid_1 = require("uuid");
const admin_1 = __importDefault(require("./admin"));
const api_1 = __importDefault(require("./api"));
const resolve_plugins_1 = require("./helpers/resolve-plugins");
const isWorkerMode = (configModule) => {
    return configModule.projectConfig.workerMode === "worker";
};
const shouldLoadBackgroundProcessors = (configModule) => {
    return (configModule.projectConfig.workerMode === "worker" ||
        configModule.projectConfig.workerMode === "shared");
};
async function subscribersLoader(plugins) {
    const pluginSubscribersSourcePaths = [
        /**
         * Load subscribers from the medusa/medusa package. Remove once the medusa core is converted to a plugin
         */
        (0, path_1.join)(__dirname, "../subscribers"),
    ].concat(plugins.map((plugin) => (0, path_1.join)(plugin.resolve, "subscribers")));
    const subscriberLoader = new subscribers_1.SubscriberLoader(pluginSubscribersSourcePaths);
    await subscriberLoader.load();
}
async function jobsLoader(plugins) {
    const pluginJobSourcePaths = [
        /**
         * Load jobs from the medusa/medusa package. Remove once the medusa core is converted to a plugin
         */
        (0, path_1.join)(__dirname, "../jobs"),
    ].concat(plugins.map((plugin) => (0, path_1.join)(plugin.resolve, "jobs")));
    const jobLoader = new jobs_1.JobLoader(pluginJobSourcePaths);
    await jobLoader.load();
}
async function loadEntrypoints(plugins, container, expressApp, rootDirectory) {
    const configModule = container.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
    if (shouldLoadBackgroundProcessors(configModule)) {
        await subscribersLoader(plugins);
        await jobsLoader(plugins);
    }
    if (isWorkerMode(configModule)) {
        return async () => { };
    }
    const { shutdown } = await (0, http_1.expressLoader)({
        app: expressApp,
    });
    expressApp.use((req, res, next) => {
        req.scope = container.createScope();
        req.requestId = req.headers["x-request-id"] ?? (0, uuid_1.v4)();
        next();
    });
    // Add additional information to context of request
    expressApp.use((req, res, next) => {
        const ipAddress = request_ip_1.default.getClientIp(req);
        req.request_context = {
            ip_address: ipAddress,
        };
        next();
    });
    await (0, admin_1.default)({ app: expressApp, configModule, rootDirectory, plugins });
    await (0, api_1.default)({
        container,
        plugins,
        app: expressApp,
    });
    return shutdown;
}
async function initializeContainer(rootDirectory) {
    await (0, config_1.configLoader)(rootDirectory, "medusa-config");
    await (0, feature_flags_1.featureFlagsLoader)((0, path_1.join)(__dirname, "feature-flags"));
    framework_1.container.register({
        [utils_1.ContainerRegistrationKeys.LOGGER]: (0, awilix_1.asValue)(logger_1.logger),
        [utils_1.ContainerRegistrationKeys.REMOTE_QUERY]: (0, awilix_1.asValue)(null),
    });
    (0, database_1.pgConnectionLoader)();
    return framework_1.container;
}
exports.default = async ({ directory: rootDirectory, expressApp, }) => {
    const container = await initializeContainer(rootDirectory);
    const configModule = container.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
    const plugins = await (0, resolve_plugins_1.getResolvedPlugins)(rootDirectory, configModule, true);
    (0, utils_1.mergePluginModules)(configModule, plugins);
    const linksSourcePaths = plugins.map((plugin) => (0, path_1.join)(plugin.resolve, "links"));
    await new links_1.LinkLoader(linksSourcePaths).load();
    const { onApplicationStart, onApplicationShutdown, onApplicationPrepareShutdown, modules, gqlSchema, } = await new framework_1.MedusaAppLoader().load();
    const workflowsSourcePaths = plugins.map((p) => (0, path_1.join)(p.resolve, "workflows"));
    const workflowLoader = new workflows_1.WorkflowLoader(workflowsSourcePaths);
    await workflowLoader.load();
    const entrypointsShutdown = await loadEntrypoints(plugins, container, expressApp, rootDirectory);
    const { createDefaultsWorkflow } = await import("@medusajs/core-flows");
    await createDefaultsWorkflow(container).run();
    await onApplicationStart();
    const shutdown = async () => {
        const pgConnection = container.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
        await onApplicationPrepareShutdown();
        await onApplicationShutdown();
        await (0, utils_1.promiseAll)([
            container.dispose(),
            // @ts-expect-error "Do we want to call `client.destroy` "
            pgConnection?.context?.destroy(),
            entrypointsShutdown(),
        ]);
    };
    return {
        container,
        app: expressApp,
        shutdown,
        modules,
        gqlSchema,
    };
};
//# sourceMappingURL=index.js.map