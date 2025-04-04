"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MedusaAppLoader_container, _MedusaAppLoader_customLinksModules;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedusaAppLoader = void 0;
const modules_sdk_1 = require("@medusajs/modules-sdk");
const utils_1 = require("@medusajs/utils");
const awilix_1 = require("awilix");
const config_1 = require("./config");
const container_1 = require("./container");
class MedusaAppLoader {
    // TODO: Adjust all loaders to accept an optional container such that in test env it is possible if needed to provide a specific container otherwise use the main container
    // Maybe also adjust the different places to resolve the config from the container instead of the configManager for the same reason
    // To be discussed
    constructor({ container, customLinksModules, } = {}) {
        /**
         * Container from where to resolve resources
         * @private
         */
        _MedusaAppLoader_container.set(this, void 0);
        /**
         * Extra links modules config which should be added manually to the links to be loaded
         * @private
         */
        _MedusaAppLoader_customLinksModules.set(this, void 0);
        __classPrivateFieldSet(this, _MedusaAppLoader_container, container ?? container_1.container, "f");
        __classPrivateFieldSet(this, _MedusaAppLoader_customLinksModules, customLinksModules ?? [], "f");
    }
    mergeDefaultModules(modulesConfig) {
        const defaultModules = Object.values(modules_sdk_1.ModulesDefinition).filter((definition) => {
            return !!definition.defaultPackage;
        });
        const configModules = { ...modulesConfig };
        for (const defaultModule of defaultModules) {
            configModules[defaultModule.key] ??=
                defaultModule.defaultModuleDeclaration;
        }
        for (const [key, value] of Object.entries(configModules)) {
            const def = {};
            def.key ??= key;
            def.label ??= modules_sdk_1.ModulesDefinition[key]?.label ?? (0, utils_1.upperCaseFirst)(key);
            def.isQueryable = modules_sdk_1.ModulesDefinition[key]?.isQueryable ?? true;
            const orignalDef = value?.definition ?? modules_sdk_1.ModulesDefinition[key];
            if (!(0, utils_1.isBoolean)(value) &&
                ((0, utils_1.isObject)(orignalDef) || !(0, utils_1.isPresent)(value.definition))) {
                value.definition = {
                    ...def,
                    ...orignalDef,
                };
            }
        }
        return configModules;
    }
    prepareSharedResourcesAndDeps() {
        const injectedDependencies = {
            [utils_1.ContainerRegistrationKeys.PG_CONNECTION]: __classPrivateFieldGet(this, _MedusaAppLoader_container, "f").resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION),
            [utils_1.ContainerRegistrationKeys.LOGGER]: __classPrivateFieldGet(this, _MedusaAppLoader_container, "f").resolve(utils_1.ContainerRegistrationKeys.LOGGER),
        };
        const driverOptions = { ...(config_1.configManager.config.projectConfig.databaseDriverOptions ?? {}) };
        const pool = driverOptions.pool ?? {};
        delete driverOptions.pool;
        const sharedResourcesConfig = {
            database: {
                clientUrl: injectedDependencies[utils_1.ContainerRegistrationKeys.PG_CONNECTION]?.client?.config?.connection?.connectionString ??
                    config_1.configManager.config.projectConfig.databaseUrl,
                driverOptions: config_1.configManager.config.projectConfig.databaseDriverOptions,
                pool: pool,
                debug: config_1.configManager.config.projectConfig.databaseLogging ?? false,
                schema: config_1.configManager.config.projectConfig.databaseSchema,
                database: config_1.configManager.config.projectConfig.databaseName,
            },
        };
        return { sharedResourcesConfig, injectedDependencies };
    }
    /**
     * Run, Revert or Generate the migrations for the medusa app.
     *
     * @param moduleNames
     * @param linkModules
     * @param action
     */
    async runModulesMigrations({ moduleNames, action = "run", } = {
        action: "run",
    }) {
        const configModules = this.mergeDefaultModules(config_1.configManager.config.modules);
        const { sharedResourcesConfig, injectedDependencies } = this.prepareSharedResourcesAndDeps();
        const migrationOptions = {
            modulesConfig: configModules,
            sharedContainer: __classPrivateFieldGet(this, _MedusaAppLoader_container, "f"),
            linkModules: __classPrivateFieldGet(this, _MedusaAppLoader_customLinksModules, "f"),
            sharedResourcesConfig,
            injectedDependencies,
        };
        if (action === "revert") {
            await (0, modules_sdk_1.MedusaAppMigrateDown)(moduleNames, migrationOptions);
        }
        else if (action === "run") {
            await (0, modules_sdk_1.MedusaAppMigrateUp)(migrationOptions);
        }
        else {
            await (0, modules_sdk_1.MedusaAppMigrateGenerate)(moduleNames, migrationOptions);
        }
    }
    /**
     * Return an instance of the link module migration planner.
     */
    async getLinksExecutionPlanner() {
        const configModules = this.mergeDefaultModules(config_1.configManager.config.modules);
        const { sharedResourcesConfig, injectedDependencies } = this.prepareSharedResourcesAndDeps();
        const migrationOptions = {
            modulesConfig: configModules,
            sharedContainer: __classPrivateFieldGet(this, _MedusaAppLoader_container, "f"),
            linkModules: __classPrivateFieldGet(this, _MedusaAppLoader_customLinksModules, "f"),
            sharedResourcesConfig,
            injectedDependencies,
        };
        return await (0, modules_sdk_1.MedusaAppGetLinksExecutionPlanner)(migrationOptions);
    }
    /**
     * Run the modules loader without taking care of anything else. This is useful for running the loader as a separate action or to re run all modules loaders.
     */
    async runModulesLoader() {
        const { sharedResourcesConfig, injectedDependencies } = this.prepareSharedResourcesAndDeps();
        const configModules = this.mergeDefaultModules(config_1.configManager.config.modules);
        await (0, modules_sdk_1.MedusaApp)({
            modulesConfig: configModules,
            sharedContainer: __classPrivateFieldGet(this, _MedusaAppLoader_container, "f"),
            linkModules: __classPrivateFieldGet(this, _MedusaAppLoader_customLinksModules, "f"),
            sharedResourcesConfig,
            injectedDependencies,
            loaderOnly: true,
        });
    }
    /**
     * Load all modules and bootstrap all the modules and links to be ready to be consumed
     * @param config
     */
    async load(config = { registerInContainer: true }) {
        const configModule = __classPrivateFieldGet(this, _MedusaAppLoader_container, "f").resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
        const { sharedResourcesConfig, injectedDependencies } = this.prepareSharedResourcesAndDeps();
        __classPrivateFieldGet(this, _MedusaAppLoader_container, "f").register(utils_1.ContainerRegistrationKeys.REMOTE_QUERY, (0, awilix_1.asValue)(undefined));
        __classPrivateFieldGet(this, _MedusaAppLoader_container, "f").register(utils_1.ContainerRegistrationKeys.QUERY, (0, awilix_1.asValue)(undefined));
        __classPrivateFieldGet(this, _MedusaAppLoader_container, "f").register(utils_1.ContainerRegistrationKeys.LINK, (0, awilix_1.asValue)(undefined));
        __classPrivateFieldGet(this, _MedusaAppLoader_container, "f").register(utils_1.ContainerRegistrationKeys.REMOTE_LINK, (0, awilix_1.aliasTo)(utils_1.ContainerRegistrationKeys.LINK));
        const configModules = this.mergeDefaultModules(configModule.modules);
        const medusaApp = await (0, modules_sdk_1.MedusaApp)({
            workerMode: configModule.projectConfig.workerMode,
            modulesConfig: configModules,
            sharedContainer: __classPrivateFieldGet(this, _MedusaAppLoader_container, "f"),
            linkModules: __classPrivateFieldGet(this, _MedusaAppLoader_customLinksModules, "f"),
            sharedResourcesConfig,
            injectedDependencies,
        });
        if (!config.registerInContainer) {
            return medusaApp;
        }
        __classPrivateFieldGet(this, _MedusaAppLoader_container, "f").register(utils_1.ContainerRegistrationKeys.LINK, (0, awilix_1.asValue)(medusaApp.link));
        __classPrivateFieldGet(this, _MedusaAppLoader_container, "f").register(utils_1.ContainerRegistrationKeys.REMOTE_LINK, (0, awilix_1.aliasTo)(utils_1.ContainerRegistrationKeys.LINK));
        __classPrivateFieldGet(this, _MedusaAppLoader_container, "f").register(utils_1.ContainerRegistrationKeys.REMOTE_QUERY, (0, awilix_1.asValue)(medusaApp.query));
        __classPrivateFieldGet(this, _MedusaAppLoader_container, "f").register(utils_1.ContainerRegistrationKeys.QUERY, (0, awilix_1.asValue)(medusaApp.query));
        for (const moduleService of Object.values(medusaApp.modules)) {
            const loadedModule = moduleService;
            container_1.container.register(loadedModule.__definition.key, (0, awilix_1.asValue)(moduleService));
        }
        // Register all unresolved modules as undefined to be present in the container with undefined value by default
        // but still resolvable
        for (const moduleDefinition of Object.values(modules_sdk_1.ModulesDefinition)) {
            if (!container_1.container.hasRegistration(moduleDefinition.key)) {
                container_1.container.register(moduleDefinition.key, (0, awilix_1.asValue)(undefined));
            }
        }
        return medusaApp;
    }
}
exports.MedusaAppLoader = MedusaAppLoader;
_MedusaAppLoader_container = new WeakMap(), _MedusaAppLoader_customLinksModules = new WeakMap();
//# sourceMappingURL=medusa-app-loader.js.map