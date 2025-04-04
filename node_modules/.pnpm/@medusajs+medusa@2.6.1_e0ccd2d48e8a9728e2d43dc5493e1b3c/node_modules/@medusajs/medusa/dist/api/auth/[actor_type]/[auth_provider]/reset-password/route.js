"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    const { auth_provider, actor_type } = req.params;
    const { identifier } = req.validatedBody;
    const { http } = req.scope.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE).projectConfig;
    await (0, core_flows_1.generateResetPasswordTokenWorkflow)(req.scope).run({
        input: {
            entityId: identifier,
            actorType: actor_type,
            provider: auth_provider,
            secret: http.jwtSecret,
        },
        throwOnError: false, // we don't want to throw on error to avoid leaking information about non-existing identities
    });
    res.sendStatus(201);
};
exports.POST = POST;
exports.AUTHENTICATE = false;
//# sourceMappingURL=route.js.map