"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../helpers");
const GET = async (req, res) => {
    const cart = await (0, helpers_1.refetchCart)(req.params.id, req.scope, req.queryConfig.fields);
    res.json({ cart });
};
exports.GET = GET;
const POST = async (req, res) => {
    const workflow = (0, core_flows_1.updateCartWorkflow)(req.scope);
    await workflow.run({
        input: {
            ...req.validatedBody,
            id: req.params.id,
        },
    });
    const cart = await (0, helpers_1.refetchCart)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ cart });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map