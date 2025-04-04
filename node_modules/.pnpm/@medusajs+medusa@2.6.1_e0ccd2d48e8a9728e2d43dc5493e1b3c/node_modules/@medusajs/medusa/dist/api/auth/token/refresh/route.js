"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const utils_1 = require("@medusajs/framework/utils");
const generate_jwt_token_1 = require("../../utils/generate-jwt-token");
// Retrieve a newly generated JWT token. All checks that the existing token is valid already happen in the auth middleware.
// The token will include the actor ID, even if the token used to refresh didn't have one.
// Note: We probably want to disallow refreshes if the password changes, and require reauth.
const POST = async (req, res) => {
    const service = req.scope.resolve(utils_1.Modules.AUTH);
    const authIdentity = await service.retrieveAuthIdentity(req.auth_context.auth_identity_id);
    const { http } = req.scope.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE).projectConfig;
    const token = (0, generate_jwt_token_1.generateJwtTokenForAuthIdentity)({ authIdentity, actorType: req.auth_context.actor_type }, {
        secret: http.jwtSecret,
        expiresIn: http.jwtExpiresIn,
    });
    return res.json({ token });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map