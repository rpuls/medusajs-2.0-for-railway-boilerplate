export declare const moduleProviderRegistrationKeyPrefix = "__providers__";
/**
 * Return the key used to register a module provider in the container
 * @param {string} moduleKey
 * @return {string}
 */
export declare function getProviderRegistrationKey({ providerId, providerIdentifier, }: {
    providerId?: string;
    providerIdentifier?: string;
}): string;
//# sourceMappingURL=module-provider-registration-key.d.ts.map