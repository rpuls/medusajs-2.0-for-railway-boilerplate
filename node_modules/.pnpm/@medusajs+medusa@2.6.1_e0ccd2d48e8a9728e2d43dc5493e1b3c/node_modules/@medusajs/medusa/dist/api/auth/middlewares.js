"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutesMiddlewares = void 0;
const http_1 = require("@medusajs/framework/http");
const validate_scope_provider_association_1 = require("./utils/validate-scope-provider-association");
const validate_token_1 = require("./utils/validate-token");
const validators_1 = require("./validators");
exports.authRoutesMiddlewares = [
    {
        method: ["POST"],
        matcher: "/auth/session",
        middlewares: [(0, http_1.authenticate)("*", "bearer")],
    },
    {
        method: ["DELETE"],
        matcher: "/auth/session",
        middlewares: [(0, http_1.authenticate)("*", ["session"])],
    },
    {
        method: ["POST"],
        matcher: "/auth/token/refresh",
        middlewares: [(0, http_1.authenticate)("*", "bearer", { allowUnregistered: true })],
    },
    {
        method: ["POST"],
        matcher: "/auth/:actor_type/:auth_provider/callback",
        middlewares: [(0, validate_scope_provider_association_1.validateScopeProviderAssociation)()],
    },
    {
        method: ["POST"],
        matcher: "/auth/:actor_type/:auth_provider/register",
        middlewares: [(0, validate_scope_provider_association_1.validateScopeProviderAssociation)()],
    },
    {
        method: ["POST"],
        matcher: "/auth/:actor_type/:auth_provider",
        middlewares: [(0, validate_scope_provider_association_1.validateScopeProviderAssociation)()],
    },
    {
        method: ["GET"],
        matcher: "/auth/:actor_type/:auth_provider",
        middlewares: [(0, validate_scope_provider_association_1.validateScopeProviderAssociation)()],
    },
    {
        method: ["POST"],
        matcher: "/auth/:actor_type/:auth_provider/reset-password",
        middlewares: [
            (0, validate_scope_provider_association_1.validateScopeProviderAssociation)(),
            (0, http_1.validateAndTransformBody)(validators_1.ResetPasswordRequest),
        ],
    },
    {
        method: ["POST"],
        matcher: "/auth/:actor_type/:auth_provider/update",
        middlewares: [(0, validate_scope_provider_association_1.validateScopeProviderAssociation)(), (0, validate_token_1.validateToken)()],
    },
];
//# sourceMappingURL=middlewares.js.map