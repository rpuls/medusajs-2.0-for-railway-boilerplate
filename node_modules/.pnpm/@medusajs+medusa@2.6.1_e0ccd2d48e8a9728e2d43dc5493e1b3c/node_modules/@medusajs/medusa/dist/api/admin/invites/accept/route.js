"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    if (req.auth_context.actor_id) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "The user is already authenticated and cannot accept an invite.");
    }
    const input = {
        invite_token: req.filterableFields.token,
        auth_identity_id: req.auth_context.auth_identity_id,
        user: req.validatedBody,
    };
    let users;
    try {
        const { result } = await (0, core_flows_1.acceptInviteWorkflow)(req.scope).run({ input });
        users = result;
    }
    catch (e) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    res.status(200).json({ user: users[0] });
};
exports.POST = POST;
exports.AUTHENTICATE = false;
//# sourceMappingURL=route.js.map