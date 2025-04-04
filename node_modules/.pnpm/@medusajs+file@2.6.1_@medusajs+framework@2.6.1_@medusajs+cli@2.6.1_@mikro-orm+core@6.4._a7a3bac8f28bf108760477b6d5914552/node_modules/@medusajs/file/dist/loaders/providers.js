"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modules_sdk_1 = require("@medusajs/framework/modules-sdk");
const _services_1 = require("../services");
const _types_1 = require("../types");
const awilix_1 = require("awilix");
const registrationFn = async (klass, container, pluginOptions) => {
    const key = _services_1.FileProviderService.getRegistrationIdentifier(klass, pluginOptions.id);
    container.register({
        [_types_1.FileProviderRegistrationPrefix + key]: (0, awilix_1.asFunction)((cradle) => new klass(cradle, pluginOptions.options ?? {}), {
            lifetime: klass.LIFE_TIME || awilix_1.Lifetime.SINGLETON,
        }),
    });
    container.registerAdd(_types_1.FileProviderIdentifierRegistrationName, (0, awilix_1.asValue)(key));
};
exports.default = async ({ container, options, }) => {
    await (0, modules_sdk_1.moduleProviderLoader)({
        container,
        providers: options?.providers || [],
        registerServiceFn: registrationFn,
    });
};
//# sourceMappingURL=providers.js.map