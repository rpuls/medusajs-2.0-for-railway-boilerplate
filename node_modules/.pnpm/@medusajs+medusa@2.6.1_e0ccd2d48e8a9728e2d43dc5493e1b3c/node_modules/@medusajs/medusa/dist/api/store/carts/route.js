"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("./helpers");
const POST = async (req, res) => {
    const workflowInput = {
        ...req.validatedBody,
        customer_id: req.auth_context?.actor_id,
    };
    const { result } = await (0, core_flows_1.createCartWorkflow)(req.scope).run({
        input: workflowInput,
    });
    const cart = await (0, helpers_1.refetchCart)(result.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ cart });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map