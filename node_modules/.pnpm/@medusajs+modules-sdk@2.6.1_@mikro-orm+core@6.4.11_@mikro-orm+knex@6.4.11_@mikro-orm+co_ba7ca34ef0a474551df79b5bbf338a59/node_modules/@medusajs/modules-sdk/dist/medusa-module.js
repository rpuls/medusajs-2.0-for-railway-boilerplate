"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedusaModule = void 0;
const utils_1 = require("@medusajs/utils");
const awilix_1 = require("awilix");
const os_1 = require("os");
const loaders_1 = require("./loaders");
const utils_2 = require("./loaders/utils");
const types_1 = require("./types");
const logger = {
    log: (a) => console.log(a),
    info: (a) => console.log(a),
    warn: (a) => console.warn(a),
    error: (a) => console.error(a),
};
class MedusaModule {
    static getLoadedModules(aliases) {
        return [...MedusaModule.modules_.entries()].map(([key]) => {
            if (aliases?.has(key)) {
                return MedusaModule.getModuleInstance(key, aliases.get(key));
            }
            return MedusaModule.getModuleInstance(key);
        });
    }
    static onApplicationStart(onApplicationStartCb) {
        for (const instances of MedusaModule.instances_.values()) {
            for (const instance of Object.values(instances)) {
                if (instance?.__hooks) {
                    instance.__hooks?.onApplicationStart
                        ?.bind(instance)()
                        .then(() => {
                        onApplicationStartCb?.();
                    })
                        .catch(() => {
                        // The module should handle this and log it
                        return void 0;
                    });
                }
            }
        }
    }
    static async onApplicationShutdown() {
        await (0, utils_1.promiseAll)([...MedusaModule.instances_.values()]
            .map((instances) => {
            return Object.values(instances).map((instance) => {
                return instance.__hooks?.onApplicationShutdown
                    ?.bind(instance)()
                    .catch(() => {
                    // The module should handle this and log it
                    return void 0;
                });
            });
        })
            .flat());
    }
    static async onApplicationPrepareShutdown() {
        await (0, utils_1.promiseAll)([...MedusaModule.instances_.values()]
            .map((instances) => {
            return Object.values(instances).map((instance) => {
                return instance.__hooks?.onApplicationPrepareShutdown
                    ?.bind(instance)()
                    .catch(() => {
                    // The module should handle this and log it
                    return void 0;
                });
            });
        })
            .flat());
    }
    static clearInstances() {
        MedusaModule.instances_.clear();
        MedusaModule.modules_.clear();
        MedusaModule.joinerConfig_.clear();
        MedusaModule.moduleResolutions_.clear();
        MedusaModule.customLinks_.length = 0;
    }
    static isInstalled(moduleKey, alias) {
        if (alias) {
            return (MedusaModule.modules_.has(moduleKey) &&
                MedusaModule.modules_.get(moduleKey).some((m) => m.alias === alias));
        }
        return MedusaModule.modules_.has(moduleKey);
    }
    static getJoinerConfig(moduleKey) {
        return MedusaModule.joinerConfig_.get(moduleKey);
    }
    static getAllJoinerConfigs() {
        return [...MedusaModule.joinerConfig_.values()];
    }
    static getModuleResolutions(moduleKey) {
        return MedusaModule.moduleResolutions_.get(moduleKey);
    }
    static getAllModuleResolutions() {
        return [...MedusaModule.moduleResolutions_.values()];
    }
    static setModuleResolution(moduleKey, resolution) {
        MedusaModule.moduleResolutions_.set(moduleKey, resolution);
        return resolution;
    }
    static setJoinerConfig(moduleKey, config) {
        MedusaModule.joinerConfig_.set(moduleKey, config);
        return config;
    }
    static setCustomLink(config) {
        MedusaModule.customLinks_.push(config);
    }
    static getCustomLinks() {
        return MedusaModule.customLinks_;
    }
    static getModuleInstance(moduleKey, alias) {
        if (!MedusaModule.modules_.has(moduleKey)) {
            return;
        }
        let mod;
        const modules = MedusaModule.modules_.get(moduleKey);
        if (alias) {
            mod = modules.find((m) => m.alias === alias);
            return MedusaModule.instances_.get(mod?.hash);
        }
        mod = modules.find((m) => m.main) ?? modules[0];
        return MedusaModule.instances_.get(mod?.hash);
    }
    static registerModule(moduleKey, loadedModule) {
        if (!MedusaModule.modules_.has(moduleKey)) {
            MedusaModule.modules_.set(moduleKey, []);
        }
        const modules = MedusaModule.modules_.get(moduleKey);
        if (modules.some((m) => m.alias === loadedModule.alias)) {
            throw new Error(`Module ${moduleKey} already registed as '${loadedModule.alias}'. Please choose a different alias.`);
        }
        if (loadedModule.main) {
            if (modules.some((m) => m.main)) {
                throw new Error(`Module ${moduleKey} already have a 'main' registered.`);
            }
        }
        modules.push(loadedModule);
        MedusaModule.modules_.set(moduleKey, modules);
    }
    /**
     * Load all modules and resolve them once they are loaded
     * @param modulesOptions
     * @param migrationOnly
     * @param loaderOnly
     * @param workerMode
     */
    static async bootstrapAll(modulesOptions, { migrationOnly, loaderOnly, workerMode, }) {
        return await MedusaModule.bootstrap_(modulesOptions, {
            migrationOnly,
            loaderOnly,
            workerMode,
        });
    }
    /**
     * Load a single module and resolve it once it is loaded
     * @param moduleKey
     * @param defaultPath
     * @param declaration
     * @param moduleExports
     * @param sharedContainer
     * @param moduleDefinition
     * @param injectedDependencies
     * @param migrationOnly
     * @param loaderOnly
     * @param workerMode
     */
    static async bootstrap({ moduleKey, defaultPath, declaration, moduleExports, sharedContainer, moduleDefinition, injectedDependencies, migrationOnly, loaderOnly, workerMode, }) {
        const [service] = await MedusaModule.bootstrap_([
            {
                moduleKey,
                defaultPath,
                declaration,
                moduleExports,
                sharedContainer,
                moduleDefinition,
                injectedDependencies,
            },
        ], {
            migrationOnly,
            loaderOnly,
            workerMode,
        });
        return service;
    }
    /**
     * Load all modules and then resolve them once they are loaded
     *
     * @param modulesOptions
     * @param migrationOnly
     * @param loaderOnly
     * @param workerMode
     * @protected
     */
    static async bootstrap_(modulesOptions, { migrationOnly, loaderOnly, workerMode, }) {
        let loadedModules = [];
        const services = [];
        for (const moduleOptions of modulesOptions) {
            const { moduleKey, defaultPath, declaration, moduleExports, sharedContainer, moduleDefinition, injectedDependencies, } = moduleOptions;
            const hashKey = (0, utils_1.simpleHash)((0, utils_1.stringifyCircular)({ moduleKey, defaultPath, declaration }));
            let finishLoading;
            let errorLoading;
            const loadingPromise = new Promise((resolve, reject) => {
                finishLoading = resolve;
                errorLoading = reject;
            });
            if (!loaderOnly && MedusaModule.instances_.has(hashKey)) {
                services.push(MedusaModule.instances_.get(hashKey));
                continue;
            }
            if (!loaderOnly && MedusaModule.loading_.has(hashKey)) {
                services.push(await MedusaModule.loading_.get(hashKey));
                continue;
            }
            if (!loaderOnly) {
                MedusaModule.loading_.set(hashKey, loadingPromise);
            }
            let modDeclaration = declaration ??
                {};
            if (declaration?.scope !== types_1.MODULE_SCOPE.EXTERNAL) {
                modDeclaration = {
                    scope: declaration?.scope || types_1.MODULE_SCOPE.INTERNAL,
                    resolve: defaultPath,
                    options: declaration?.options ?? declaration,
                    dependencies: declaration?.dependencies ?? [],
                    alias: declaration?.alias,
                    main: declaration?.main,
                    worker_mode: workerMode,
                };
            }
            const container = sharedContainer ?? (0, utils_1.createMedusaContainer)();
            if (injectedDependencies) {
                for (const service in injectedDependencies) {
                    container.register(service, (0, awilix_1.asValue)(injectedDependencies[service]));
                    if (!container.hasRegistration(service)) {
                        container.register(service, (0, awilix_1.asValue)(injectedDependencies[service]));
                    }
                }
            }
            const moduleResolutions = (0, loaders_1.registerMedusaModule)(moduleKey, modDeclaration, moduleExports, moduleDefinition);
            const logger_ = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER, {
                allowUnregistered: true,
            }) ?? logger;
            try {
                await (0, loaders_1.moduleLoader)({
                    container,
                    moduleResolutions,
                    logger: logger_,
                    migrationOnly,
                    loaderOnly,
                });
            }
            catch (err) {
                errorLoading(err);
                throw err;
            }
            loadedModules.push({
                hashKey,
                modDeclaration,
                moduleResolutions,
                container,
                finishLoading,
            });
        }
        if (loaderOnly) {
            loadedModules.forEach(({ finishLoading }) => finishLoading({}));
            return [{}];
        }
        for (const { hashKey, modDeclaration, moduleResolutions, container, finishLoading, } of loadedModules) {
            const service = await MedusaModule.resolveLoadedModule({
                hashKey,
                modDeclaration,
                moduleResolutions,
                container,
            });
            MedusaModule.instances_.set(hashKey, service);
            finishLoading(service);
            MedusaModule.loading_.delete(hashKey);
            services.push(service);
        }
        return services;
    }
    /**
     * Resolve all the modules once they all have been loaded through the bootstrap
     * and store their references in the instances_ map and return them
     *
     * @param hashKey
     * @param modDeclaration
     * @param moduleResolutions
     * @param container
     * @private
     */
    static async resolveLoadedModule({ hashKey, modDeclaration, moduleResolutions, container, }) {
        const logger_ = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER, {
            allowUnregistered: true,
        }) ?? logger;
        const services = {};
        for (const resolution of Object.values(moduleResolutions)) {
            const keyName = resolution.definition.key;
            services[keyName] = container.resolve(keyName);
            services[keyName].__definition = resolution.definition;
            services[keyName].__definition.resolvePath =
                "resolve" in modDeclaration &&
                    typeof modDeclaration.resolve === "string"
                    ? modDeclaration.resolve
                    : undefined;
            if (resolution.definition.isQueryable) {
                let joinerConfig;
                try {
                    // TODO: rework that to store on a separate property
                    joinerConfig = await services[keyName].__joinerConfig?.();
                }
                catch {
                    // noop
                }
                if (!joinerConfig) {
                    throw new Error(`Your module is missing a joiner config: ${keyName}. If this module is not queryable, please set { definition: { isQueryable: false } } in your module configuration.`);
                }
                if (!joinerConfig.primaryKeys) {
                    logger_.warn(`Primary keys are not defined by the module ${keyName}. Setting default primary key to 'id'${os_1.EOL}`);
                    joinerConfig.primaryKeys = ["id"];
                }
                services[keyName].__joinerConfig = joinerConfig;
                MedusaModule.setJoinerConfig(keyName, joinerConfig);
            }
            MedusaModule.setModuleResolution(keyName, resolution);
            MedusaModule.registerModule(keyName, {
                key: keyName,
                hash: hashKey,
                alias: modDeclaration.alias ?? hashKey,
                main: !!modDeclaration.main,
                isLink: false,
            });
        }
        return services;
    }
    static async bootstrapLink({ definition, declaration, moduleExports, injectedDependencies, }) {
        const moduleKey = definition.key;
        const hashKey = (0, utils_1.simpleHash)((0, utils_1.stringifyCircular)({ moduleKey, declaration }));
        if (MedusaModule.instances_.has(hashKey)) {
            return { [moduleKey]: MedusaModule.instances_.get(hashKey) };
        }
        if (MedusaModule.loading_.has(hashKey)) {
            return await MedusaModule.loading_.get(hashKey);
        }
        let finishLoading;
        let errorLoading;
        MedusaModule.loading_.set(hashKey, new Promise((resolve, reject) => {
            finishLoading = resolve;
            errorLoading = reject;
        }));
        let modDeclaration = declaration ?? {};
        const moduleDefinition = {
            key: definition.key,
            dependencies: definition.dependencies,
            defaultPackage: "",
            label: definition.label,
            isRequired: false,
            isQueryable: true,
            defaultModuleDeclaration: definition.defaultModuleDeclaration,
        };
        modDeclaration = {
            resolve: "",
            options: declaration,
            alias: declaration?.alias,
            main: declaration?.main,
        };
        const container = (0, utils_1.createMedusaContainer)();
        if (injectedDependencies) {
            for (const service in injectedDependencies) {
                container.register(service, (0, awilix_1.asValue)(injectedDependencies[service]));
            }
        }
        const moduleResolutions = (0, loaders_1.registerMedusaLinkModule)(moduleDefinition, modDeclaration, moduleExports);
        const logger_ = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER, {
            allowUnregistered: true,
        }) ?? logger;
        try {
            await (0, loaders_1.moduleLoader)({
                container,
                moduleResolutions,
                logger: logger_,
            });
        }
        catch (err) {
            errorLoading(err);
            throw err;
        }
        const services = {};
        for (const resolution of Object.values(moduleResolutions)) {
            const keyName = resolution.definition.key;
            services[keyName] = container.resolve(keyName);
            services[keyName].__definition = resolution.definition;
            if (resolution.definition.isQueryable) {
                let joinerConfig;
                try {
                    joinerConfig = await services[keyName].__joinerConfig?.();
                }
                catch {
                    // noop
                }
                if (!joinerConfig) {
                    throw new Error(`Your module is missing a joiner config: ${keyName}. If this module is not queryable, please set { definition: { isQueryable: false } } in your module configuration.`);
                }
                services[keyName].__joinerConfig = joinerConfig;
                MedusaModule.setJoinerConfig(keyName, joinerConfig);
                if (!joinerConfig.isLink) {
                    throw new Error("MedusaModule.bootstrapLink must be used only for Link Modules");
                }
            }
            MedusaModule.setModuleResolution(keyName, resolution);
            MedusaModule.registerModule(keyName, {
                key: keyName,
                hash: hashKey,
                alias: modDeclaration.alias ?? hashKey,
                main: !!modDeclaration.main,
                isLink: true,
            });
        }
        MedusaModule.instances_.set(hashKey, services);
        finishLoading(services);
        MedusaModule.loading_.delete(hashKey);
        return services;
    }
    static async migrateGenerate({ options, container, moduleExports, moduleKey, modulePath, }) {
        const moduleResolutions = (0, loaders_1.registerMedusaModule)(moduleKey, {
            scope: types_1.MODULE_SCOPE.INTERNAL,
            resolve: modulePath,
            options,
        });
        const logger_ = container?.resolve(utils_1.ContainerRegistrationKeys.LOGGER, {
            allowUnregistered: true,
        }) ?? logger;
        container ??= (0, utils_1.createMedusaContainer)();
        for (const mod in moduleResolutions) {
            const { generateMigration } = await (0, utils_2.loadModuleMigrations)(moduleResolutions[mod], moduleExports);
            if (typeof generateMigration === "function") {
                await generateMigration({
                    options,
                    container: container,
                    logger: logger_,
                });
            }
        }
    }
    static async migrateUp({ options, container, moduleExports, moduleKey, modulePath, }) {
        const moduleResolutions = (0, loaders_1.registerMedusaModule)(moduleKey, {
            scope: types_1.MODULE_SCOPE.INTERNAL,
            resolve: modulePath,
            options,
        });
        const logger_ = container?.resolve(utils_1.ContainerRegistrationKeys.LOGGER, {
            allowUnregistered: true,
        }) ?? logger;
        container ??= (0, utils_1.createMedusaContainer)();
        for (const mod in moduleResolutions) {
            const { runMigrations } = await (0, utils_2.loadModuleMigrations)(moduleResolutions[mod], moduleExports);
            if (typeof runMigrations === "function") {
                await runMigrations({
                    options,
                    container: container,
                    logger: logger_,
                });
            }
        }
    }
    static async migrateDown({ options, container, moduleExports, moduleKey, modulePath, }) {
        const moduleResolutions = (0, loaders_1.registerMedusaModule)(moduleKey, {
            scope: types_1.MODULE_SCOPE.INTERNAL,
            resolve: modulePath,
            options,
        });
        const logger_ = container?.resolve(utils_1.ContainerRegistrationKeys.LOGGER, {
            allowUnregistered: true,
        }) ?? logger;
        container ??= (0, utils_1.createMedusaContainer)();
        for (const mod in moduleResolutions) {
            const { revertMigration } = await (0, utils_2.loadModuleMigrations)(moduleResolutions[mod], moduleExports);
            if (typeof revertMigration === "function") {
                await revertMigration({
                    options,
                    container: container,
                    logger: logger_,
                });
            }
        }
    }
}
MedusaModule.instances_ = new Map();
MedusaModule.modules_ = new Map();
MedusaModule.customLinks_ = [];
MedusaModule.loading_ = new Map();
MedusaModule.joinerConfig_ = new Map();
MedusaModule.moduleResolutions_ = new Map();
global.MedusaModule ??= MedusaModule;
const GlobalMedusaModule = global.MedusaModule;
exports.MedusaModule = GlobalMedusaModule;
//# sourceMappingURL=medusa-module.js.map