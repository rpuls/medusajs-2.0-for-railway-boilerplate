"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const http_1 = require("@medusajs/framework/http");
const POST = async (req, res) => {
    const { id } = req.params;
    await (0, core_flows_1.markPaymentCollectionAsPaid)(req.scope).run({
        input: {
            ...req.body,
            payment_collection_id: id,
            captured_by: req.auth_context.actor_id,
        },
    });
    const paymentCollection = await (0, http_1.refetchEntity)("payment_collection", id, req.scope, req.queryConfig.fields);
    res.status(200).json({ payment_collection: paymentCollection });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map