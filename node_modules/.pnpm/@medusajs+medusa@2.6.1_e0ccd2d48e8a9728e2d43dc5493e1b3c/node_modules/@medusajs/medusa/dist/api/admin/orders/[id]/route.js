"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const workflow = (0, core_flows_1.getOrderDetailWorkflow)(req.scope);
    const { result } = await workflow.run({
        input: {
            fields: req.queryConfig.fields,
            order_id: req.params.id,
            version: req.validatedQuery.version,
        },
    });
    res.status(200).json({ order: result });
};
exports.GET = GET;
const POST = async (req, res) => {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    await (0, core_flows_1.updateOrderWorkflow)(req.scope).run({
        input: {
            ...req.validatedBody,
            user_id: req.auth_context.actor_id,
            id: req.params.id,
        },
    });
    const result = await query.graph({
        entity: "order",
        filters: { id: req.params.id },
        fields: req.queryConfig.fields,
    });
    res.status(200).json({ order: result.data[0] });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map