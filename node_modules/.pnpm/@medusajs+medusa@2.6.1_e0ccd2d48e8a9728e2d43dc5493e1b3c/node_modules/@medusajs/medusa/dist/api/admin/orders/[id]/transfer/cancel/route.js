"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const orderId = req.params.id;
    const userId = req.auth_context.actor_id;
    await (0, core_flows_1.cancelOrderTransferRequestWorkflow)(req.scope).run({
        input: {
            order_id: orderId,
            logged_in_user_id: userId,
            actor_type: req.auth_context.actor_type,
        },
    });
    const result = await query.graph({
        entity: "order",
        filters: { id: orderId },
        fields: req.queryConfig.fields,
    });
    res.status(200).json({ order: result.data[0] });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map