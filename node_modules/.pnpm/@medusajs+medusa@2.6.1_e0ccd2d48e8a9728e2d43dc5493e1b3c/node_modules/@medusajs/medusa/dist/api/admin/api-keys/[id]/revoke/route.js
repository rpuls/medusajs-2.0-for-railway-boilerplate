"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../../helpers");
const POST = async (req, res) => {
    await (0, core_flows_1.revokeApiKeysWorkflow)(req.scope).run({
        input: {
            selector: { id: req.params.id },
            revoke: {
                ...req.validatedBody,
                revoked_by: req.auth_context.actor_id,
            },
        },
    });
    const apiKey = await (0, helpers_1.refetchApiKey)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ api_key: apiKey });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map