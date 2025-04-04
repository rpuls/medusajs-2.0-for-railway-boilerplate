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
var _AuthProviderService_logger;
Object.defineProperty(exports, "__esModule", { value: true });
const _types_1 = require("../types");
class AuthProviderService {
    constructor(container) {
        _AuthProviderService_logger.set(this, void 0);
        this.dependencies = container;
        __classPrivateFieldSet(this, _AuthProviderService_logger, container["logger"]
            ? container.logger
            : console, "f");
    }
    retrieveProviderRegistration(providerId) {
        try {
            return this.dependencies[`${_types_1.AuthProviderRegistrationPrefix}${providerId}`];
        }
        catch (err) {
            if (err.name === "AwilixResolutionError") {
                const errMessage = `
Unable to retrieve the auth provider with id: ${providerId}
Please make sure that the provider is registered in the container and it is configured correctly in your project configuration file.`;
                throw new Error(errMessage);
            }
            const errMessage = `Unable to retrieve the auth provider with id: ${providerId}, the following error occurred: ${err.message}`;
            __classPrivateFieldGet(this, _AuthProviderService_logger, "f").error(errMessage);
            throw new Error(errMessage);
        }
    }
    async authenticate(provider, auth, authIdentityProviderService) {
        const providerHandler = this.retrieveProviderRegistration(provider);
        return await providerHandler.authenticate(auth, authIdentityProviderService);
    }
    async register(provider, auth, authIdentityProviderService) {
        const providerHandler = this.retrieveProviderRegistration(provider);
        return await providerHandler.register(auth, authIdentityProviderService);
    }
    async update(provider, data, authIdentityProviderService) {
        const providerHandler = this.retrieveProviderRegistration(provider);
        return await providerHandler.update(data, authIdentityProviderService);
    }
    async validateCallback(provider, auth, authIdentityProviderService) {
        const providerHandler = this.retrieveProviderRegistration(provider);
        return await providerHandler.validateCallback(auth, authIdentityProviderService);
    }
}
_AuthProviderService_logger = new WeakMap();
exports.default = AuthProviderService;
//# sourceMappingURL=auth-provider.js.map