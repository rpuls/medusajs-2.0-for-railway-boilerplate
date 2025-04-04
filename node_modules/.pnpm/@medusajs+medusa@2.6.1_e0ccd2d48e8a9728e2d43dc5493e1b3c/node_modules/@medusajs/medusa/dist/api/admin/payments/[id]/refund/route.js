"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../../helpers");
const POST = async (req, res) => {
    const { id } = req.params;
    await (0, core_flows_1.refundPaymentWorkflow)(req.scope).run({
        input: {
            payment_id: id,
            created_by: req.auth_context.actor_id,
            ...req.validatedBody,
        },
    });
    const payment = await (0, helpers_1.refetchPayment)(id, req.scope, req.queryConfig.fields);
    res.status(200).json({ payment });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map