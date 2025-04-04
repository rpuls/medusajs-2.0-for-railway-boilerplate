"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const http_1 = require("@medusajs/framework/http");
const POST = async (req, res) => {
    const { id: orderId, fulfillment_id: fulfillmentId } = req.params;
    await (0, core_flows_1.markOrderFulfillmentAsDeliveredWorkflow)(req.scope).run({
        input: { orderId, fulfillmentId },
    });
    const order = await (0, http_1.refetchEntity)("order", orderId, req.scope, req.queryConfig.fields);
    res.status(200).json({ order });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map