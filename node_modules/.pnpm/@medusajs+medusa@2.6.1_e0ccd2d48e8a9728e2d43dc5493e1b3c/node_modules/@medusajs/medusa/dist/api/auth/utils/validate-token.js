"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = void 0;
const http_1 = require("@medusajs/framework/http");
const utils_1 = require("@medusajs/framework/utils");
// Middleware to validate that a token is valid
const validateToken = () => {
    return async (req, res, next) => {
        const { actor_type, auth_provider } = req.params;
        const req_ = req;
        // @ts-ignore
        const { http } = req_.scope.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE).projectConfig;
        const token = (0, http_1.getAuthContextFromJwtToken)(req.headers.authorization, http.jwtSecret, ["bearer"], [actor_type]);
        const errorObject = new utils_1.MedusaError(utils_1.MedusaError.Types.UNAUTHORIZED, `Invalid token`);
        if (!token) {
            return next(errorObject);
        }
        const authModule = req.scope.resolve(utils_1.Modules.AUTH);
        if (!token?.entity_id) {
            return next(errorObject);
        }
        const [providerIdentity] = await authModule.listProviderIdentities({
            entity_id: token.entity_id,
            provider: auth_provider,
        }, {
            select: ["provider_metadata", "auth_identity_id", "entity_id"],
        });
        if (!providerIdentity) {
            return next(errorObject);
        }
        req_.auth_context = {
            actor_type,
            auth_identity_id: providerIdentity.auth_identity_id,
            actor_id: providerIdentity.entity_id,
            app_metadata: {},
        };
        return next();
    };
};
exports.validateToken = validateToken;
//# sourceMappingURL=validate-token.js.map