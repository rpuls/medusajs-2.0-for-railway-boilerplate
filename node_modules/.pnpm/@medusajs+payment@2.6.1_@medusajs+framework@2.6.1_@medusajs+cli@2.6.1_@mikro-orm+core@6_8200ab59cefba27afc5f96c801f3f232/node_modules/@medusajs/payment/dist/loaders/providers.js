"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const modules_sdk_1 = require("@medusajs/framework/modules-sdk");
const awilix_1 = require("awilix");
const utils_1 = require("@medusajs/framework/utils");
const providers = __importStar(require("../providers"));
const PROVIDER_REGISTRATION_KEY = "payment_providers";
const registrationFn = async (klass, container, pluginOptions) => {
    if (!klass?.identifier) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_ARGUMENT, `Trying to register a payment provider without a provider identifier.`);
    }
    const key = `pp_${klass.identifier}${pluginOptions.id ? `_${pluginOptions.id}` : ""}`;
    container.register({
        [key]: (0, awilix_1.asFunction)((cradle) => new klass(cradle, pluginOptions.options), {
            lifetime: klass.LIFE_TIME || awilix_1.Lifetime.SINGLETON,
        }),
    });
    container.registerAdd(PROVIDER_REGISTRATION_KEY, (0, awilix_1.asValue)(key));
};
exports.default = async ({ container, options, }) => {
    // Local providers
    for (const provider of Object.values(providers)) {
        await registrationFn(provider, container, { id: "default" });
    }
    await (0, modules_sdk_1.moduleProviderLoader)({
        container,
        providers: options?.providers || [],
        registerServiceFn: registrationFn,
    });
    await registerProvidersInDb({ container });
};
const registerProvidersInDb = async ({ container, }) => {
    const providersToLoad = container.resolve(PROVIDER_REGISTRATION_KEY);
    const paymentProviderService = container.resolve("paymentProviderService");
    const existingProviders = await paymentProviderService.list({ id: providersToLoad }, {});
    const upsertData = [];
    for (const { id } of existingProviders) {
        if (!providersToLoad.includes(id)) {
            upsertData.push({ id, is_enabled: false });
        }
    }
    for (const id of providersToLoad) {
        upsertData.push({ id, is_enabled: true });
    }
    await paymentProviderService.upsert(upsertData);
};
//# sourceMappingURL=providers.js.map