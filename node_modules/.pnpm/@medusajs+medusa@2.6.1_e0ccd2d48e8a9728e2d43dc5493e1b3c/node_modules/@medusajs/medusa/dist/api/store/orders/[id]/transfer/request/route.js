"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const POST = async (req, res) => {
    const orderId = req.params.id;
    const customerId = req.auth_context.actor_id;
    await (0, core_flows_1.requestOrderTransferWorkflow)(req.scope).run({
        input: {
            order_id: orderId,
            customer_id: customerId,
            logged_in_user: customerId,
            description: req.validatedBody.description,
        },
    });
    const { result } = await (0, core_flows_1.getOrderDetailWorkflow)(req.scope).run({
        input: {
            fields: req.queryConfig.fields,
            order_id: orderId,
        },
    });
    res.status(200).json({ order: result });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map