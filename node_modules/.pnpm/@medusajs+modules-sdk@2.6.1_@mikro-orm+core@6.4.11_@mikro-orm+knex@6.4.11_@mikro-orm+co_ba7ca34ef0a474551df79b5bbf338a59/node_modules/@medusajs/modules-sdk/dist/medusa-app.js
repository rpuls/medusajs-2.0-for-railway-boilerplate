"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadModules = loadModules;
exports.MedusaApp = MedusaApp;
exports.MedusaAppMigrateUp = MedusaAppMigrateUp;
exports.MedusaAppMigrateDown = MedusaAppMigrateDown;
exports.MedusaAppMigrateGenerate = MedusaAppMigrateGenerate;
exports.MedusaAppGetLinksExecutionPlanner = MedusaAppGetLinksExecutionPlanner;
const utils_1 = require("@medusajs/utils");
const awilix_1 = require("awilix");
const link_1 = require("./link");
const medusa_module_1 = require("./medusa-module");
const remote_query_1 = require("./remote-query");
const types_1 = require("./types");
const LinkModulePackage = utils_1.MODULE_PACKAGE_NAMES[utils_1.Modules.LINK];
async function loadModules(args) {
    const { modulesConfig, sharedContainer, sharedResourcesConfig, migrationOnly = false, loaderOnly = false, workerMode = "shared", } = args;
    const allModules = {};
    const modulesToLoad = [];
    for (const moduleName of Object.keys(modulesConfig)) {
        const mod = modulesConfig[moduleName];
        let path;
        let moduleExports = undefined;
        let declaration = {};
        let definition = undefined;
        // TODO: We are keeping mod === false for backward compatibility for now
        if (mod === false || ((0, utils_1.isObject)(mod) && "disable" in mod && mod.disable)) {
            continue;
        }
        if ((0, utils_1.isObject)(mod)) {
            const mod_ = mod;
            path = mod_.resolve ?? utils_1.MODULE_PACKAGE_NAMES[moduleName];
            definition = mod_.definition;
            moduleExports = !(0, utils_1.isString)(mod_.resolve)
                ? mod_.resolve
                : undefined;
            declaration = { ...mod };
            delete declaration.definition;
        }
        else {
            path = utils_1.MODULE_PACKAGE_NAMES[moduleName];
        }
        declaration.scope ??= types_1.MODULE_SCOPE.INTERNAL;
        if (declaration.scope === types_1.MODULE_SCOPE.INTERNAL) {
            declaration.options ??= {};
            if (!declaration.options.database) {
                declaration.options[utils_1.isSharedConnectionSymbol] = true;
            }
            declaration.options.database ??= {
                ...sharedResourcesConfig?.database,
            };
            declaration.options.database.debug ??=
                sharedResourcesConfig?.database?.debug;
        }
        modulesToLoad.push({
            moduleKey: moduleName,
            defaultPath: path,
            declaration,
            sharedContainer,
            moduleDefinition: definition,
            moduleExports,
        });
    }
    const loaded = (await medusa_module_1.MedusaModule.bootstrapAll(modulesToLoad, {
        migrationOnly,
        loaderOnly,
        workerMode,
    }));
    if (loaderOnly) {
        return allModules;
    }
    for (const { moduleKey } of modulesToLoad) {
        const service = loaded.find((loadedModule) => loadedModule[moduleKey])?.[moduleKey];
        if (!service) {
            throw new Error(`Module ${moduleKey} could not be loaded.`);
        }
        sharedContainer.register({
            [service.__definition.key]: (0, awilix_1.asValue)(service),
        });
        if (allModules[moduleKey] && !Array.isArray(allModules[moduleKey])) {
            allModules[moduleKey] = [];
        }
        if (allModules[moduleKey]) {
            ;
            allModules[moduleKey].push(service);
        }
        else {
            allModules[moduleKey] = service;
        }
    }
    return allModules;
}
async function initializeLinks({ config, linkModules, injectedDependencies, moduleExports, }) {
    try {
        let resources = moduleExports;
        if (!resources) {
            const module = await (0, utils_1.dynamicImport)(LinkModulePackage);
            if ("discoveryPath" in module) {
                const reExportedLoadedModule = await (0, utils_1.dynamicImport)(module.discoveryPath);
                resources = reExportedLoadedModule.default ?? reExportedLoadedModule;
            }
        }
        const { initialize, getMigrationPlanner } = resources;
        const linkResolution = await initialize(config, linkModules, injectedDependencies);
        return {
            remoteLink: new link_1.Link(),
            linkResolution,
            getMigrationPlanner,
        };
    }
    catch (err) {
        console.warn("Error initializing link modules.", err);
        return {
            remoteLink: undefined,
            linkResolution: undefined,
            getMigrationPlanner: () => void 0,
        };
    }
}
function isMedusaModule(mod) {
    return typeof mod?.initialize === "function";
}
function cleanAndMergeSchema(loadedSchema) {
    const defaultMedusaSchema = `
    scalar DateTime
    scalar JSON
  `;
    const { schema: cleanedSchema, notFound } = utils_1.GraphQLUtils.cleanGraphQLSchema(defaultMedusaSchema + loadedSchema);
    const mergedSchema = utils_1.GraphQLUtils.mergeTypeDefs(cleanedSchema);
    return {
        schema: utils_1.GraphQLUtils.makeExecutableSchema({ typeDefs: mergedSchema }),
        notFound,
    };
}
function getLoadedSchema() {
    return medusa_module_1.MedusaModule.getAllJoinerConfigs()
        .map((joinerConfig) => joinerConfig?.schema ?? "")
        .join("\n");
}
function registerCustomJoinerConfigs(servicesConfig) {
    for (const config of servicesConfig) {
        if (!config.serviceName || config.isReadOnlyLink) {
            continue;
        }
        medusa_module_1.MedusaModule.setJoinerConfig(config.serviceName, config);
    }
}
async function MedusaApp_({ sharedContainer, sharedResourcesConfig, servicesConfig, modulesConfigPath, modulesConfigFileName, modulesConfig, linkModules, remoteFetchData, injectedDependencies = {}, migrationOnly = false, loaderOnly = false, workerMode = "shared", } = {}) {
    const sharedContainer_ = (0, utils_1.createMedusaContainer)({}, sharedContainer);
    const onApplicationShutdown = async () => {
        await (0, utils_1.promiseAll)([
            medusa_module_1.MedusaModule.onApplicationShutdown(),
            sharedContainer_.dispose(),
        ]);
    };
    const onApplicationPrepareShutdown = async () => {
        await (0, utils_1.promiseAll)([medusa_module_1.MedusaModule.onApplicationPrepareShutdown()]);
    };
    const onApplicationStart = async () => {
        await medusa_module_1.MedusaModule.onApplicationStart();
    };
    const modules = modulesConfig ??
        (await (0, utils_1.dynamicImport)(modulesConfigPath ??
            process.cwd() + (modulesConfigFileName ?? "/modules-config"))).default;
    const dbData = utils_1.ModulesSdkUtils.loadDatabaseConfig("medusa", sharedResourcesConfig, true);
    registerCustomJoinerConfigs(servicesConfig ?? []);
    if (sharedResourcesConfig?.database?.connection &&
        !injectedDependencies[utils_1.ContainerRegistrationKeys.PG_CONNECTION]) {
        injectedDependencies[utils_1.ContainerRegistrationKeys.PG_CONNECTION] =
            sharedResourcesConfig.database.connection;
    }
    else if (dbData.clientUrl &&
        !injectedDependencies[utils_1.ContainerRegistrationKeys.PG_CONNECTION]) {
        injectedDependencies[utils_1.ContainerRegistrationKeys.PG_CONNECTION] =
            utils_1.ModulesSdkUtils.createPgConnection({
                ...(sharedResourcesConfig?.database ?? {}),
                ...dbData,
            });
    }
    // remove the link module from the modules
    const linkModule = modules[LinkModulePackage] ?? modules[utils_1.Modules.LINK];
    delete modules[LinkModulePackage];
    delete modules[utils_1.Modules.LINK];
    let linkModuleOrOptions = {};
    if ((0, utils_1.isObject)(linkModule)) {
        linkModuleOrOptions = linkModule;
    }
    for (const injectedDependency of Object.keys(injectedDependencies)) {
        sharedContainer_.register({
            [injectedDependency]: (0, awilix_1.asValue)(injectedDependencies[injectedDependency]),
        });
    }
    const allModules = await loadModules({
        modulesConfig: modules,
        sharedContainer: sharedContainer_,
        sharedResourcesConfig: { database: dbData },
        migrationOnly,
        loaderOnly,
        workerMode,
    });
    if (loaderOnly) {
        async function query(...args) {
            throw new Error("Querying not allowed in loaderOnly mode");
        }
        query.graph = query;
        query.gql = query;
        return {
            onApplicationShutdown,
            onApplicationPrepareShutdown,
            onApplicationStart,
            modules: allModules,
            link: undefined,
            query: query,
            runMigrations: async () => {
                throw new Error("Migrations not allowed in loaderOnly mode");
            },
            revertMigrations: async () => {
                throw new Error("Revert migrations not allowed in loaderOnly mode");
            },
            generateMigrations: async () => {
                throw new Error("Generate migrations not allowed in loaderOnly mode");
            },
            linkMigrationExecutionPlanner: () => {
                throw new Error("Migrations planner is not avaibable in loaderOnly mode");
            },
        };
    }
    // Share Event bus with link modules
    injectedDependencies[utils_1.Modules.EVENT_BUS] = sharedContainer_.resolve(utils_1.Modules.EVENT_BUS, {
        allowUnregistered: true,
    });
    linkModules ??= [];
    if (!Array.isArray(linkModules)) {
        linkModules = [linkModules];
    }
    linkModules.push(...medusa_module_1.MedusaModule.getCustomLinks());
    const allLoadedJoinerConfigs = medusa_module_1.MedusaModule.getAllJoinerConfigs();
    for (let linkIdx = 0; linkIdx < linkModules.length; linkIdx++) {
        const customLink = linkModules[linkIdx];
        if (typeof customLink === "function") {
            linkModules[linkIdx] = customLink(allLoadedJoinerConfigs);
        }
    }
    const { remoteLink, getMigrationPlanner } = await initializeLinks({
        config: linkModuleOrOptions,
        linkModules,
        injectedDependencies,
        moduleExports: isMedusaModule(linkModule) ? linkModule : undefined,
    });
    const loadedSchema = getLoadedSchema();
    const { schema, notFound } = cleanAndMergeSchema(loadedSchema);
    const entitiesMap = schema.getTypeMap();
    const remoteQuery = new remote_query_1.RemoteQuery({
        servicesConfig,
        customRemoteFetchData: remoteFetchData,
        entitiesMap,
    });
    const applyMigration = async ({ modulesNames, action = "run", }) => {
        const moduleResolutions = modulesNames.map((moduleName) => {
            return {
                moduleName,
                resolution: medusa_module_1.MedusaModule.getModuleResolutions(moduleName),
            };
        });
        const missingModules = moduleResolutions
            .filter(({ resolution }) => !resolution)
            .map(({ moduleName }) => moduleName);
        if (missingModules.length) {
            const error = new utils_1.MedusaError(utils_1.MedusaError.Types.UNKNOWN_MODULES, `Cannot ${action} migrations for unknown module(s) ${missingModules.join(",")}`, utils_1.MedusaError.Codes.UNKNOWN_MODULES);
            error["allModules"] = Object.keys(allModules);
            throw error;
        }
        for (const { resolution: moduleResolution } of moduleResolutions) {
            if (!moduleResolution.options?.database &&
                moduleResolution.moduleDeclaration?.scope === types_1.MODULE_SCOPE.INTERNAL) {
                moduleResolution.options ??= {};
                moduleResolution.options.database = {
                    ...(sharedResourcesConfig?.database ?? {}),
                };
                moduleResolution.options.database.debug ??=
                    sharedResourcesConfig?.database?.debug;
            }
            const migrationOptions = {
                moduleKey: moduleResolution.definition.key,
                modulePath: moduleResolution.resolutionPath,
                container: sharedContainer,
                options: moduleResolution.options,
                moduleExports: moduleResolution.moduleExports,
            };
            if (action === "revert") {
                await medusa_module_1.MedusaModule.migrateDown(migrationOptions);
            }
            else if (action === "run") {
                await medusa_module_1.MedusaModule.migrateUp(migrationOptions);
            }
            else {
                await medusa_module_1.MedusaModule.migrateGenerate(migrationOptions);
            }
        }
    };
    const runMigrations = async () => {
        await applyMigration({
            modulesNames: Object.keys(allModules),
        });
    };
    const revertMigrations = async (modulesNames) => {
        await applyMigration({
            modulesNames,
            action: "revert",
        });
    };
    const generateMigrations = async (modulesNames) => {
        await applyMigration({
            modulesNames,
            action: "generate",
        });
    };
    const getMigrationPlannerFn = () => {
        const options = "scope" in linkModuleOrOptions
            ? { ...linkModuleOrOptions.options }
            : {
                ...linkModuleOrOptions,
            };
        options.database ??= {
            ...sharedResourcesConfig?.database,
        };
        options.database.debug ??= sharedResourcesConfig?.database?.debug;
        return getMigrationPlanner(options, linkModules);
    };
    const indexModule = sharedContainer_.resolve(utils_1.Modules.INDEX, {
        allowUnregistered: true,
    });
    return {
        onApplicationShutdown,
        onApplicationPrepareShutdown,
        onApplicationStart,
        modules: allModules,
        link: remoteLink,
        query: (0, remote_query_1.createQuery)({
            remoteQuery,
            indexModule,
        }), // TODO: rm any once we remove the old RemoteQueryFunction and rely on the Query object instead,
        entitiesMap,
        gqlSchema: schema,
        notFound,
        runMigrations,
        revertMigrations,
        generateMigrations,
        linkMigrationExecutionPlanner: getMigrationPlannerFn,
        sharedContainer: sharedContainer_,
    };
}
async function MedusaApp(options = {}) {
    return await MedusaApp_(options);
}
async function MedusaAppMigrateUp(options = {}) {
    const migrationOnly = true;
    const { runMigrations } = await MedusaApp_({
        ...options,
        migrationOnly,
    });
    await runMigrations().finally(medusa_module_1.MedusaModule.clearInstances);
}
async function MedusaAppMigrateDown(moduleNames, options = {}) {
    const migrationOnly = true;
    const { revertMigrations } = await MedusaApp_({
        ...options,
        migrationOnly,
    });
    await revertMigrations(moduleNames).finally(medusa_module_1.MedusaModule.clearInstances);
}
async function MedusaAppMigrateGenerate(moduleNames, options = {}) {
    const migrationOnly = true;
    const { generateMigrations } = await MedusaApp_({
        ...options,
        migrationOnly,
    });
    await generateMigrations(moduleNames).finally(medusa_module_1.MedusaModule.clearInstances);
}
async function MedusaAppGetLinksExecutionPlanner(options = {}) {
    const migrationOnly = true;
    const { linkMigrationExecutionPlanner } = await MedusaApp_({
        ...options,
        migrationOnly,
    });
    return linkMigrationExecutionPlanner();
}
//# sourceMappingURL=medusa-app.js.map