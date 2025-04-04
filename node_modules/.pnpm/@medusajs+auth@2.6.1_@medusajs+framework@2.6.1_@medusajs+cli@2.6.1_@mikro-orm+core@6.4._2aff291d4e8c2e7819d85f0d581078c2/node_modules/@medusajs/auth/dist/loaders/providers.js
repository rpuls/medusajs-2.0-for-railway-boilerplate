"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const awilix_1 = require("awilix");
const modules_sdk_1 = require("@medusajs/framework/modules-sdk");
const _types_1 = require("../types");
const registrationFn = async (klass, container, pluginOptions) => {
    container.register({
        [_types_1.AuthProviderRegistrationPrefix + pluginOptions.id]: (0, awilix_1.asFunction)((cradle) => new klass(cradle, pluginOptions.options ?? {}), {
            lifetime: klass.LIFE_TIME || awilix_1.Lifetime.SINGLETON,
        }),
    });
    container.registerAdd(_types_1.AuthIdentifiersRegistrationName, (0, awilix_1.asValue)(pluginOptions.id));
};
exports.default = async ({ container, options, }) => {
    await (0, modules_sdk_1.moduleProviderLoader)({
        container,
        providers: options?.providers || [],
        registerServiceFn: registrationFn,
    });
};
//# sourceMappingURL=providers.js.map