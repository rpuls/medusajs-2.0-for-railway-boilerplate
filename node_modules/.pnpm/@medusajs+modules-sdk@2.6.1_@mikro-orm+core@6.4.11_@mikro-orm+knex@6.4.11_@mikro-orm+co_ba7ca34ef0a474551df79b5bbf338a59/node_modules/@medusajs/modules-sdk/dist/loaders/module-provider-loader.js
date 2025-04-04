"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleProviderLoader = moduleProviderLoader;
exports.loadModuleProvider = loadModuleProvider;
const utils_1 = require("@medusajs/utils");
const awilix_1 = require("awilix");
async function moduleProviderLoader({ container, providers, registerServiceFn, }) {
    if (!providers?.length) {
        return;
    }
    await (0, utils_1.promiseAll)(providers.map(async (moduleDetails) => {
        await loadModuleProvider(container, moduleDetails, registerServiceFn);
    }));
}
async function loadModuleProvider(container, provider, registerServiceFn) {
    let loadedProvider;
    const moduleName = provider.resolve ?? "";
    try {
        loadedProvider = provider.resolve;
        if ((0, utils_1.isString)(provider.resolve)) {
            const normalizedPath = (0, utils_1.normalizeImportPathWithSource)(provider.resolve);
            loadedProvider = await (0, utils_1.dynamicImport)(normalizedPath);
        }
    }
    catch (error) {
        throw new Error(`Unable to find module ${moduleName} -- perhaps you need to install its package?`);
    }
    loadedProvider = loadedProvider.default ?? loadedProvider;
    if (!loadedProvider?.services?.length) {
        throw new Error(`${provider.resolve} doesn't seem to have a main service exported -- make sure your module has a default export of a service.`);
    }
    return await (0, utils_1.promiseAll)(loadedProvider.services.map(async (service) => {
        // Ask the provider to validate its options
        await service.validateOptions?.(provider.options);
        const name = (0, utils_1.lowerCaseFirst)(service.name);
        if (registerServiceFn) {
            // Used to register the specific type of service in the provider
            await registerServiceFn(service, container, {
                id: provider.id,
                options: provider.options,
            });
        }
        else {
            container.register({
                [name]: (0, awilix_1.asFunction)((cradle) => new service(cradle, provider.options), {
                    lifetime: service.LIFE_TIME || awilix_1.Lifetime.SCOPED,
                }),
            });
        }
        return service;
    }));
}
//# sourceMappingURL=module-provider-loader.js.map