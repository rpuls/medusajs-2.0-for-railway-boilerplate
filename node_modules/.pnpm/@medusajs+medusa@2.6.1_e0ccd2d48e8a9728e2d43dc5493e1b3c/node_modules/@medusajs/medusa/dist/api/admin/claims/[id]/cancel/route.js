"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const POST = async (req, res) => {
    const { id } = req.params;
    const workflow = (0, core_flows_1.cancelOrderClaimWorkflow)(req.scope);
    const { result } = await workflow.run({
        input: {
            ...req.validatedBody,
            claim_id: id,
            canceled_by: req.auth_context.actor_id,
        },
    });
    res.status(200).json({ claim: result });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map