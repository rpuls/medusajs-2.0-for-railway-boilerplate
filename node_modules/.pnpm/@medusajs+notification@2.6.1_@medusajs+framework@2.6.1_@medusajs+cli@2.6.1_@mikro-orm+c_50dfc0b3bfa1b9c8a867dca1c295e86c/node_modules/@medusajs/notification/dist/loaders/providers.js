"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modules_sdk_1 = require("@medusajs/framework/modules-sdk");
const utils_1 = require("@medusajs/framework/utils");
const _services_1 = require("../services");
const _types_1 = require("../types");
const awilix_1 = require("awilix");
const registrationFn = async (klass, container, pluginOptions) => {
    container.register({
        [_types_1.NotificationProviderRegistrationPrefix + pluginOptions.id]: (0, awilix_1.asFunction)((cradle) => new klass(cradle, pluginOptions.options ?? {}), {
            lifetime: klass.LIFE_TIME || awilix_1.Lifetime.SINGLETON,
        }),
    });
    container.registerAdd(_types_1.NotificationIdentifiersRegistrationName, (0, awilix_1.asValue)(pluginOptions.id));
};
exports.default = async ({ container, options, }) => {
    await (0, modules_sdk_1.moduleProviderLoader)({
        container,
        providers: options?.providers || [],
        registerServiceFn: registrationFn,
    });
    await syncDatabaseProviders({
        container,
        providers: options?.providers || [],
    });
};
async function syncDatabaseProviders({ container, providers, }) {
    const providerServiceRegistrationKey = (0, utils_1.lowerCaseFirst)(_services_1.NotificationProviderService.name);
    const providerService = container.resolve(providerServiceRegistrationKey);
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER) ?? console;
    const normalizedProviders = providers.map((provider) => {
        if (!provider.id) {
            throw new Error("An entry in the provider config is required to initialize notification providers");
        }
        const config = provider.options;
        return {
            id: provider.id,
            handle: provider.id,
            name: provider.id,
            is_enabled: true,
            channels: config?.channels ?? [],
        };
    });
    validateProviders(normalizedProviders);
    try {
        const providersInDb = await providerService.list({});
        const providersToDisable = providersInDb.filter((dbProvider) => !normalizedProviders.some((normalizedProvider) => normalizedProvider.id === dbProvider.id));
        const promises = [];
        if (normalizedProviders.length) {
            promises.push(providerService.upsert(normalizedProviders));
        }
        if (providersToDisable.length) {
            promises.push(providerService.update(providersToDisable.map((p) => ({
                id: p.id,
                is_enabled: false,
            }))));
        }
        await (0, utils_1.promiseAll)(promises);
    }
    catch (error) {
        logger.error(`Error syncing the notification providers: ${error.message}`);
    }
}
function validateProviders(providers) {
    const hasForChannel = {};
    providers.forEach((provider) => {
        provider.channels.forEach((channel) => {
            if (hasForChannel[channel]) {
                throw new Error(`Multiple providers are configured for the same channel: ${channel}`);
            }
            hasForChannel[channel] = true;
        });
    });
}
//# sourceMappingURL=providers.js.map