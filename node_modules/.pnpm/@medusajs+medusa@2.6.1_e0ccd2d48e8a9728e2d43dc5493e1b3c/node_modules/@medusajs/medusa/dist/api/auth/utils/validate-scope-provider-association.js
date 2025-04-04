"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateScopeProviderAssociation = void 0;
const utils_1 = require("@medusajs/framework/utils");
// Middleware to validate that a scope is associated with a provider
const validateScopeProviderAssociation = () => {
    return async (req, _, next) => {
        const { actor_type, auth_provider } = req.params;
        const config = req.scope.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
        const authMethodsPerActor = config.projectConfig?.http?.authMethodsPerActor ?? {};
        // Not having the config defined would allow for all auth providers for the particular actor.
        if (authMethodsPerActor[actor_type]) {
            if (!authMethodsPerActor[actor_type].includes(auth_provider)) {
                throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `The actor type ${actor_type} is not allowed to use the auth provider ${auth_provider}`);
            }
        }
        next();
    };
};
exports.validateScopeProviderAssociation = validateScopeProviderAssociation;
//# sourceMappingURL=validate-scope-provider-association.js.map