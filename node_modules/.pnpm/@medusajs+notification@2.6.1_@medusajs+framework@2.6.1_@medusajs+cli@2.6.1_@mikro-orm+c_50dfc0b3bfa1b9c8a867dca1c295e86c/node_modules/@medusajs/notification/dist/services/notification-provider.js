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
var _NotificationProviderService_logger;
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("../models");
const _types_1 = require("../types");
class NotificationProviderService extends utils_1.ModulesSdkUtils.MedusaInternalService(_models_1.NotificationProvider) {
    constructor(container) {
        super(container);
        // We can store the providers in a memory since they can only be registered on startup and not changed during runtime
        _NotificationProviderService_logger.set(this, void 0);
        this.notificationProviderRepository_ =
            container.notificationProviderRepository;
        __classPrivateFieldSet(this, _NotificationProviderService_logger, container["logger"]
            ? container.logger
            : console, "f");
    }
    retrieveProviderRegistration(providerId) {
        try {
            return this.__container__[`${_types_1.NotificationProviderRegistrationPrefix}${providerId}`];
        }
        catch (err) {
            if (err.name === "AwilixResolutionError") {
                const errMessage = `
Unable to retrieve the notification provider with id: ${providerId}
Please make sure that the provider is registered in the container and it is configured correctly in your project configuration file.`;
                throw new Error(errMessage);
            }
            const errMessage = `Unable to retrieve the notification provider with id: ${providerId}, the following error occurred: ${err.message}`;
            __classPrivateFieldGet(this, _NotificationProviderService_logger, "f").error(errMessage);
            throw new Error(errMessage);
        }
    }
    async getProviderForChannels(channels) {
        if (!this.providersCache) {
            const providers = await this.notificationProviderRepository_.find({
                where: { is_enabled: true },
            });
            this.providersCache = new Map(providers.flatMap((provider) => provider.channels.map((c) => [c, provider])));
        }
        const normalizedChannels = Array.isArray(channels) ? channels : [channels];
        const results = normalizedChannels
            .map((channel) => this.providersCache.get(channel))
            .filter(Boolean);
        return (Array.isArray(channels) ? results : results[0]);
    }
    async send(provider, notification) {
        const providerHandler = this.retrieveProviderRegistration(provider.id);
        return await providerHandler.send(notification);
    }
}
_NotificationProviderService_logger = new WeakMap();
exports.default = NotificationProviderService;
//# sourceMappingURL=notification-provider.js.map