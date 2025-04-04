"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    const { auth_provider } = req.params;
    const authService = req.scope.resolve(utils_1.Modules.AUTH);
    const updateData = {
        ...req.body,
        entity_id: req.auth_context.actor_id, // comes from the validated token
    };
    const { authIdentity, success, error } = await authService.updateProvider(auth_provider, updateData);
    if (success && authIdentity) {
        return res.status(200).json({ success: true });
    }
    throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNAUTHORIZED, error || "Unauthorized");
};
exports.POST = POST;
//# sourceMappingURL=route.js.map