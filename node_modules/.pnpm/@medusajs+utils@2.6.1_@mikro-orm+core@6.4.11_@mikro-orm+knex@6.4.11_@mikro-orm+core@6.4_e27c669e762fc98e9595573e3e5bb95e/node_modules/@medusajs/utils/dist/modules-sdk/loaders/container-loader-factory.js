"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleContainerLoaderFactory = moduleContainerLoaderFactory;
exports.loadModuleServices = loadModuleServices;
exports.loadModuleRepositories = loadModuleRepositories;
const awilix_1 = require("awilix");
const medusa_internal_service_1 = require("../medusa-internal-service");
const common_1 = require("../../common");
const dal_1 = require("../../dal");
/**
 * Factory for creating a container loader for a module.
 *
 * @param moduleModels
 * @param moduleServices
 * @param moduleRepositories
 * @param customRepositoryLoader The default repository loader is based on mikro orm. If you want to use a custom repository loader, you can pass it here.
 */
function moduleContainerLoaderFactory({ moduleModels, moduleServices, moduleRepositories = {}, customRepositoryLoader = loadModuleRepositories, }) {
    return async function containerLoader({ container, options, }) {
        const customRepositories = options?.repositories;
        loadModuleServices({
            moduleModels,
            moduleServices,
            container,
        });
        const repositoryLoader = customRepositoryLoader ?? loadModuleRepositories;
        repositoryLoader({
            moduleModels,
            moduleRepositories,
            customRepositories: customRepositories ?? {},
            container,
        });
    };
}
/**
 * Load the services from the module services object. If a service is not
 * present a default service will be created for the model.
 *
 * @param moduleModels
 * @param moduleServices
 * @param container
 */
function loadModuleServices({ moduleModels, moduleServices, container, }) {
    const moduleServicesMap = new Map(Object.entries(moduleServices).map(([key, service]) => [
        (0, common_1.lowerCaseFirst)(key),
        service,
    ]));
    // Build default services for all models that are not present in the module services
    Object.values(moduleModels).forEach((Model) => {
        const mappedServiceName = (0, common_1.lowerCaseFirst)(Model.name) + "Service";
        const finalService = moduleServicesMap.get(mappedServiceName);
        if (!finalService) {
            moduleServicesMap.set(mappedServiceName, (0, medusa_internal_service_1.MedusaInternalService)(Model));
        }
    });
    const allServices = [...moduleServicesMap];
    allServices.forEach(([key, service]) => {
        container.register({
            [(0, common_1.lowerCaseFirst)(key)]: (0, awilix_1.asClass)(service).singleton(),
        });
    });
}
/**
 * Load the repositories from the custom repositories object. If a repository is not
 * present in the custom repositories object, the default repository will be used from the module repository.
 * If none are present, a default repository will be created for the model.
 *
 * @param moduleModels
 * @param moduleRepositories
 * @param customRepositories
 * @param container
 */
function loadModuleRepositories({ moduleModels, moduleRepositories = {}, customRepositories, container, }) {
    const customRepositoriesMap = new Map(Object.entries(customRepositories).map(([key, repository]) => [
        (0, common_1.lowerCaseFirst)(key),
        repository,
    ]));
    const moduleRepositoriesMap = new Map(Object.entries(moduleRepositories).map(([key, repository]) => [
        (0, common_1.lowerCaseFirst)(key),
        repository,
    ]));
    // Build default repositories for all models that are not present in the custom repositories or module repositories
    Object.values(moduleModels).forEach((Model) => {
        const mappedRepositoryName = (0, common_1.lowerCaseFirst)(Model.name) + "Repository";
        let finalRepository = customRepositoriesMap.get(mappedRepositoryName);
        finalRepository ??= moduleRepositoriesMap.get(mappedRepositoryName);
        if (!finalRepository) {
            moduleRepositoriesMap.set(mappedRepositoryName, (0, dal_1.mikroOrmBaseRepositoryFactory)(Model));
        }
    });
    const allRepositories = [...customRepositoriesMap, ...moduleRepositoriesMap];
    container.register({
        ["baseRepository"]: (0, awilix_1.asClass)(dal_1.MikroOrmBaseRepository).singleton(),
    });
    allRepositories.forEach(([key, repository]) => {
        let finalRepository = customRepositoriesMap.get(key);
        if (!finalRepository) {
            finalRepository = repository;
        }
        container.register({
            [(0, common_1.lowerCaseFirst)(key)]: (0, awilix_1.asClass)(finalRepository).singleton(),
        });
    });
}
//# sourceMappingURL=container-loader-factory.js.map