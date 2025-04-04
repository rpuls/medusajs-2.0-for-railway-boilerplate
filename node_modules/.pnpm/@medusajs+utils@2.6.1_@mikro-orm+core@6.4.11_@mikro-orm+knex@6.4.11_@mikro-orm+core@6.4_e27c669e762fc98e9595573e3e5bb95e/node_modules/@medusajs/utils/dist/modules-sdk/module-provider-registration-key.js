"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleProviderRegistrationKeyPrefix = void 0;
exports.getProviderRegistrationKey = getProviderRegistrationKey;
exports.moduleProviderRegistrationKeyPrefix = "__providers__";
/**
 * Return the key used to register a module provider in the container
 * @param {string} moduleKey
 * @return {string}
 */
function getProviderRegistrationKey({ providerId, providerIdentifier, }) {
    const registrationIdentifier = `${providerIdentifier ? providerIdentifier : ""}${providerId ? `${providerIdentifier ? "_" : ""}${providerId}` : ""}`;
    return exports.moduleProviderRegistrationKeyPrefix + registrationIdentifier;
}
//# sourceMappingURL=module-provider-registration-key.js.map