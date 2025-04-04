"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const POST = async (req, res) => {
    await (0, core_flows_1.declineOrderTransferRequestWorkflow)(req.scope).run({
        input: {
            order_id: req.params.id,
            token: req.validatedBody.token,
        },
    });
    const { result } = await (0, core_flows_1.getOrderDetailWorkflow)(req.scope).run({
        input: {
            fields: req.queryConfig.fields,
            order_id: req.params.id,
        },
    });
    res.status(200).json({ order: result });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map