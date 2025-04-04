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
var _LockingProviderService_logger;
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const types_1 = require("../types");
class LockingProviderService {
    constructor(container) {
        _LockingProviderService_logger.set(this, void 0);
        this.__container__ = container;
        __classPrivateFieldSet(this, _LockingProviderService_logger, container["logger"]
            ? container.logger
            : console, "f");
    }
    static getRegistrationIdentifier(providerClass) {
        if (!providerClass.identifier) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_ARGUMENT, `Trying to register a locking provider without an identifier.`);
        }
        return `${providerClass.identifier}`;
    }
    retrieveProviderRegistration(providerId) {
        try {
            return this.__container__[`${types_1.LockingProviderRegistrationPrefix}${providerId}`];
        }
        catch (err) {
            if (err.name === "AwilixResolutionError") {
                const errMessage = `
 Unable to retrieve the locking provider with id: ${providerId}
Please make sure that the provider is registered in the container and it is configured correctly in your project configuration file.`;
                throw new Error(errMessage);
            }
            const errMessage = `Unable to retrieve the locking provider with id: ${providerId}, the following error occurred: ${err.message}`;
            __classPrivateFieldGet(this, _LockingProviderService_logger, "f").error(errMessage);
            throw new Error(errMessage);
        }
    }
}
_LockingProviderService_logger = new WeakMap();
exports.default = LockingProviderService;
//# sourceMappingURL=locking-provider.js.map