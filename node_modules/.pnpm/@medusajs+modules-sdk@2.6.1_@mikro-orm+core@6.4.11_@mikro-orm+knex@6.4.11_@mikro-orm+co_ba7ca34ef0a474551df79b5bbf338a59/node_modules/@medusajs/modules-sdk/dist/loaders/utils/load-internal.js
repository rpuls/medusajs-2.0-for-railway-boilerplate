"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveModuleExports = resolveModuleExports;
exports.loadInternalModule = loadInternalModule;
exports.loadModuleMigrations = loadModuleMigrations;
exports.loadResources = loadResources;
const utils_1 = require("@medusajs/utils");
const awilix_1 = require("awilix");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
async function resolveModuleExports({ resolution, }) {
    let resolvedModuleExports;
    try {
        if (resolution.moduleExports) {
            // TODO:
            // If we want to benefit from the auto load mechanism, even if the module exports is provided, we need to ask for the module path
            resolvedModuleExports = resolution.moduleExports;
            resolvedModuleExports.discoveryPath = resolution.resolutionPath;
        }
        else {
            const module = await (0, utils_1.dynamicImport)(resolution.resolutionPath);
            if ("discoveryPath" in module) {
                const reExportedLoadedModule = await (0, utils_1.dynamicImport)(module.discoveryPath);
                const discoveryPath = module.discoveryPath;
                resolvedModuleExports =
                    reExportedLoadedModule.default ?? reExportedLoadedModule;
                resolvedModuleExports.discoveryPath = discoveryPath;
            }
            else {
                resolvedModuleExports =
                    module.default ?? module;
                resolvedModuleExports.discoveryPath =
                    resolution.resolutionPath;
            }
        }
        return resolvedModuleExports;
    }
    catch (error) {
        if (resolution.definition.isRequired &&
            resolution.definition.defaultPackage) {
            return {
                error: new Error(`Make sure you have installed the default package: ${resolution.definition.defaultPackage}`),
            };
        }
        return { error };
    }
}
async function loadInternalProvider(args, providers) {
    const { container, resolution, logger, migrationOnly } = args;
    const errors = [];
    for (const provider of providers) {
        const providerRes = provider.resolve;
        const canLoadProvider = providerRes && ((0, utils_1.isString)(providerRes) || !providerRes?.services);
        if (!canLoadProvider) {
            continue;
        }
        const res = await loadInternalModule({
            container,
            resolution: {
                ...resolution,
                moduleExports: !(0, utils_1.isString)(providerRes) ? providerRes : undefined,
                definition: {
                    ...resolution.definition,
                    key: provider.id,
                },
                resolutionPath: (0, utils_1.isString)(provider.resolve)
                    ? require.resolve(provider.resolve, {
                        paths: [process.cwd()],
                    })
                    : false,
            },
            logger,
            migrationOnly,
            loadingProviders: true,
        });
        if (res) {
            errors.push(res);
        }
    }
    const errorMessages = errors.map((e) => e.error?.message).join("\n");
    return errors.length
        ? {
            error: {
                name: "ModuleProviderError",
                message: `Errors while loading module providers for module ${resolution.definition.key}:\n${errorMessages}`,
                stack: errors.map((e) => e.error?.stack).join("\n"),
            },
        }
        : undefined;
}
async function loadInternalModule(args) {
    const { container, resolution, logger, migrationOnly, loaderOnly, loadingProviders, } = args;
    const keyName = !loaderOnly
        ? resolution.definition.key
        : resolution.definition.key + "__loaderOnly";
    const loadedModule = await resolveModuleExports({ resolution });
    if ("error" in loadedModule) {
        return loadedModule;
    }
    let moduleResources = {};
    if (loadedModule.discoveryPath) {
        moduleResources = await loadResources({
            moduleResolution: resolution,
            discoveryPath: loadedModule.discoveryPath,
            logger,
            loadedModuleLoaders: loadedModule?.loaders,
        });
    }
    const loadedModule_ = loadedModule;
    if (!loadingProviders &&
        !loadedModule_?.service &&
        !moduleResources.moduleService) {
        container.register({
            [keyName]: (0, awilix_1.asValue)(undefined),
        });
        return {
            error: new Error(`No service found in module ${resolution?.definition?.label}. Make sure your module exports a service.`),
        };
    }
    const localContainer = (0, utils_1.createMedusaContainer)();
    const dependencies = resolution?.dependencies ?? [];
    dependencies.push(utils_1.ContainerRegistrationKeys.MANAGER, utils_1.ContainerRegistrationKeys.CONFIG_MODULE, utils_1.ContainerRegistrationKeys.LOGGER, utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    for (const dependency of dependencies) {
        localContainer.register(dependency, (0, awilix_1.asFunction)(() => {
            return container.resolve(dependency, { allowUnregistered: true });
        }));
    }
    if (resolution.definition.__passSharedContainer) {
        localContainer.register("sharedContainer", (0, awilix_1.asFunction)(() => {
            return container;
        }));
    }
    // if module has providers, load them
    let providerOptions = undefined;
    if (!loadingProviders) {
        const providers = resolution?.options?.providers ?? [];
        const res = await loadInternalProvider({
            ...args,
            container: localContainer,
        }, providers);
        if (res?.error) {
            return res;
        }
    }
    else {
        providerOptions = (resolution?.options?.providers).find((p) => p.id === resolution.definition.key)?.options;
    }
    if (migrationOnly && !loadingProviders) {
        const moduleService_ = moduleResources.moduleService ?? loadedModule_.service;
        // Partially loaded module, only register the service __joinerConfig function to be able to resolve it later
        const moduleService = {
            __joinerConfig: moduleService_.prototype.__joinerConfig,
        };
        container.register({
            [keyName]: (0, awilix_1.asValue)(moduleService),
        });
        return;
    }
    const loaders = moduleResources.loaders ?? loadedModule?.loaders ?? [];
    const error = await runLoaders(loaders, {
        container,
        localContainer,
        logger,
        resolution,
        loaderOnly,
        keyName,
        providerOptions,
    });
    if (error) {
        return error;
    }
    if (loadingProviders) {
        const loadedProvider_ = loadedModule;
        let moduleProviderServices = moduleResources.moduleService
            ? [moduleResources.moduleService]
            : loadedProvider_.services ?? loadedProvider_;
        if (!moduleProviderServices) {
            return;
        }
        for (const moduleProviderService of moduleProviderServices) {
            const modProvider_ = moduleProviderService;
            const originalIdentifier = modProvider_.identifier;
            const providerId = keyName;
            if (!originalIdentifier) {
                const providerResolutionName = modProvider_.DISPLAY_NAME ?? resolution.resolutionPath;
                throw new Error(`Module provider ${providerResolutionName} does not have a static "identifier" property on its service class.`);
            }
            const alreadyRegisteredProvider = container.hasRegistration((0, utils_1.getProviderRegistrationKey)({
                providerId,
                providerIdentifier: originalIdentifier,
            }));
            if (alreadyRegisteredProvider) {
                throw new Error(`Module provider ${originalIdentifier} has already been registered. Please provide a different "id" in the provider options.`);
            }
            modProvider_.__type = utils_1.MedusaModuleProviderType;
            const registrationKey = (0, utils_1.getProviderRegistrationKey)({
                providerId,
                providerIdentifier: originalIdentifier,
            });
            container.register({
                [registrationKey]: (0, awilix_1.asFunction)(() => {
                    ;
                    moduleProviderService.__type = utils_1.MedusaModuleType;
                    return new moduleProviderService(localContainer.cradle, resolution.options, resolution.moduleDeclaration);
                }).singleton(),
            });
        }
    }
    else {
        const moduleService = moduleResources.moduleService ?? loadedModule_.service;
        container.register({
            [keyName]: (0, awilix_1.asFunction)((cradle) => {
                ;
                moduleService.__type = utils_1.MedusaModuleType;
                return new moduleService(localContainer.cradle, resolution.options, resolution.moduleDeclaration);
            }).singleton(),
        });
    }
    if (loaderOnly) {
        // The expectation is only to run the loader as standalone, so we do not need to register the service and we need to cleanup all services
        const service = container.resolve(keyName);
        await service.__hooks?.onApplicationPrepareShutdown?.();
        await service.__hooks?.onApplicationShutdown?.();
    }
}
async function loadModuleMigrations(resolution, moduleExports) {
    const runMigrationsFn = [];
    const revertMigrationFn = [];
    const generateMigrationFn = [];
    try {
        const mainLoadedModule = await resolveModuleExports({
            resolution: { ...resolution, moduleExports },
        });
        if ("error" in mainLoadedModule) {
            throw mainLoadedModule.error;
        }
        const loadedServices = [mainLoadedModule];
        if (Array.isArray(resolution?.options?.providers)) {
            for (const provider of resolution.options.providers) {
                const providerRes = provider.resolve;
                const canLoadProvider = providerRes && ((0, utils_1.isString)(providerRes) || !providerRes?.services);
                if (!canLoadProvider) {
                    continue;
                }
                const loadedProvider = await resolveModuleExports({
                    resolution: {
                        ...resolution,
                        moduleExports: !(0, utils_1.isString)(providerRes) ? providerRes : undefined,
                        definition: {
                            ...resolution.definition,
                            key: provider.id,
                        },
                        resolutionPath: (0, utils_1.isString)(provider.resolve)
                            ? require.resolve(provider.resolve, { paths: [process.cwd()] })
                            : false,
                    },
                });
                if ("error" in loadedProvider) {
                    throw loadedProvider.error;
                }
                loadedServices.push(loadedProvider);
            }
        }
        const migrationScripts = [];
        for (const loadedModule of loadedServices) {
            let runMigrationsCustom = loadedModule.runMigrations;
            let revertMigrationCustom = loadedModule.revertMigration;
            let generateMigrationCustom = loadedModule.generateMigration;
            runMigrationsCustom && runMigrationsFn.push(runMigrationsCustom);
            revertMigrationCustom && revertMigrationFn.push(revertMigrationCustom);
            generateMigrationCustom &&
                generateMigrationFn.push(generateMigrationCustom);
            if (!runMigrationsCustom || !revertMigrationCustom) {
                const moduleResources = await loadResources({
                    moduleResolution: resolution,
                    discoveryPath: loadedModule.discoveryPath,
                    loadedModuleLoaders: loadedModule?.loaders,
                });
                migrationScripts.push({
                    moduleName: resolution.definition.key,
                    models: moduleResources.models,
                    pathToMigrations: (0, path_1.join)(moduleResources.normalizedPath, "migrations"),
                });
            }
            for (const migrationScriptOptions of migrationScripts) {
                const migrationUp = runMigrationsCustom ??
                    utils_1.ModulesSdkUtils.buildMigrationScript(migrationScriptOptions);
                runMigrationsFn.push(migrationUp);
                const migrationDown = revertMigrationCustom ??
                    utils_1.ModulesSdkUtils.buildRevertMigrationScript(migrationScriptOptions);
                revertMigrationFn.push(migrationDown);
                const genMigration = generateMigrationCustom ??
                    utils_1.ModulesSdkUtils.buildGenerateMigrationScript(migrationScriptOptions);
                generateMigrationFn.push(genMigration);
            }
        }
        const runMigrations = async (...args) => {
            for (const migration of runMigrationsFn.filter(Boolean)) {
                await migration.apply(migration, args);
            }
        };
        const revertMigration = async (...args) => {
            for (const migration of revertMigrationFn.filter(Boolean)) {
                await migration.apply(migration, args);
            }
        };
        const generateMigration = async (...args) => {
            for (const migration of generateMigrationFn.filter(Boolean)) {
                await migration.apply(migration, args);
            }
        };
        return {
            runMigrations,
            revertMigration,
            generateMigration,
        };
    }
    catch (e) {
        throw new Error(`Unable to resolve the migration scripts for the module ${resolution.definition.key}\n${e.message}\n${e.stack}`);
    }
}
async function importAllFromDir(path) {
    let filesToLoad = [];
    const excludedExtensions = [".ts.map", ".js.map", ".d.ts"];
    await (0, promises_1.readdir)(path).then((files) => {
        files.forEach((file) => {
            if (file.startsWith("index.") ||
                excludedExtensions.some((ext) => file.endsWith(ext))) {
                return;
            }
            const filePath = (0, path_1.join)(path, file);
            const stats = (0, fs_1.statSync)(filePath);
            if (stats.isDirectory()) {
                // TODO: should we handle that? dont think so but I put that here for discussion
            }
            else if (stats.isFile()) {
                filesToLoad.push(filePath);
            }
        });
        return filesToLoad;
    });
    return (await Promise.all(filesToLoad.map((filePath) => (0, utils_1.dynamicImport)(filePath)))).flatMap((value) => {
        return Object.values(value);
    });
}
async function loadResources({ moduleResolution, discoveryPath, logger, loadedModuleLoaders, }) {
    logger ??= console;
    loadedModuleLoaders ??= [];
    const modulePath = discoveryPath;
    let normalizedPath = (0, path_1.dirname)(require.resolve(modulePath, { paths: [process.cwd()] }));
    normalizedPath = (0, path_1.resolve)(normalizedPath);
    try {
        const defaultOnFail = () => {
            return [];
        };
        const [moduleService, services, models, repositories] = await Promise.all([
            (0, utils_1.dynamicImport)(modulePath).then((moduleExports) => {
                const mod = moduleExports.default ?? moduleExports;
                return mod.service;
            }),
            importAllFromDir((0, path_1.resolve)(normalizedPath, "services")).catch(defaultOnFail),
            importAllFromDir((0, path_1.resolve)(normalizedPath, "models")).catch(defaultOnFail),
            importAllFromDir((0, path_1.resolve)(normalizedPath, "repositories")).catch(defaultOnFail),
        ]);
        const cleanupResources = (resources) => {
            return Object.values(resources)
                .map((resource) => {
                if (utils_1.DmlEntity.isDmlEntity(resource)) {
                    return resource;
                }
                if (typeof resource === "function") {
                    return resource;
                }
                return null;
            })
                .filter((v) => !!v);
        };
        const potentialServices = [...new Set(cleanupResources(services))];
        const potentialModels = [...new Set(cleanupResources(models))];
        const mikroOrmModels = (0, utils_1.toMikroOrmEntities)(potentialModels);
        const potentialRepositories = [...new Set(cleanupResources(repositories))];
        const finalLoaders = prepareLoaders({
            loadedModuleLoaders,
            models: mikroOrmModels,
            repositories: potentialRepositories,
            services: potentialServices,
            moduleResolution,
            migrationPath: normalizedPath + "/migrations",
        });
        // if a module service is provided, we generate a joiner config
        if (moduleService) {
            generateJoinerConfigIfNecessary({
                moduleResolution,
                service: moduleService,
                models: potentialModels,
            });
        }
        return {
            services: potentialServices,
            models: mikroOrmModels,
            repositories: potentialRepositories,
            loaders: finalLoaders,
            moduleService,
            normalizedPath,
        };
    }
    catch (e) {
        logger.warn(`Unable to load resources for module ${modulePath} automagically. ${e.message}`);
        return {};
    }
}
async function runLoaders(loaders = [], { localContainer, container, logger, resolution, loaderOnly, keyName, providerOptions, }) {
    try {
        for (const loader of loaders) {
            await loader({
                container: localContainer,
                logger,
                options: providerOptions ?? resolution.options,
                dataLoaderOnly: loaderOnly,
                moduleOptions: providerOptions ? resolution.options : undefined,
            }, resolution.moduleDeclaration);
        }
    }
    catch (err) {
        container.register({
            [keyName]: (0, awilix_1.asValue)(undefined),
        });
        return {
            error: new Error(`Loaders for module ${resolution.definition.label} failed: ${err.message}`),
        };
    }
}
function prepareLoaders({ loadedModuleLoaders = [], models, repositories, services, moduleResolution, migrationPath, }) {
    const finalLoaders = [];
    const toObjectReducer = (acc, curr) => {
        acc[curr.name] = curr;
        return acc;
    };
    /*
     * If no connectionLoader function is provided, create a default connection loader.
     * TODO: Validate naming convention
     */
    const connectionLoaderName = "connectionLoader";
    const containerLoader = "containerLoader";
    const hasConnectionLoader = loadedModuleLoaders.some((l) => l.name === connectionLoaderName);
    if (!hasConnectionLoader && models.length > 0) {
        const connectionLoader = utils_1.ModulesSdkUtils.mikroOrmConnectionLoaderFactory({
            moduleName: moduleResolution.definition.key,
            moduleModels: models,
            migrationsPath: migrationPath,
        });
        finalLoaders.push(connectionLoader);
    }
    const hasContainerLoader = loadedModuleLoaders.some((l) => l.name === containerLoader);
    if (!hasContainerLoader) {
        const containerLoader = utils_1.ModulesSdkUtils.moduleContainerLoaderFactory({
            moduleModels: models.reduce(toObjectReducer, {}),
            moduleRepositories: repositories.reduce(toObjectReducer, {}),
            moduleServices: services.reduce(toObjectReducer, {}),
        });
        finalLoaders.push(containerLoader);
    }
    finalLoaders.push(...loadedModuleLoaders.filter((loader) => {
        if (loader.name !== connectionLoaderName &&
            loader.name !== containerLoader) {
            return true;
        }
        return ((loader.name === containerLoader && hasContainerLoader) ||
            (loader.name === connectionLoaderName && hasConnectionLoader));
    }));
    return finalLoaders;
}
function generateJoinerConfigIfNecessary({ moduleResolution, service, models, }) {
    const originalJoinerConfigFn = service.prototype.__joinerConfig;
    service.prototype.__joinerConfig = function () {
        if (originalJoinerConfigFn) {
            return {
                serviceName: moduleResolution.definition.key,
                ...originalJoinerConfigFn(),
            };
        }
        return (0, utils_1.defineJoinerConfig)(moduleResolution.definition.key, {
            models,
        });
    };
}
//# sourceMappingURL=load-internal.js.map