"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const http_1 = require("@medusajs/framework/http");
const GET = async (req, res) => {
    const refund_reason = await (0, http_1.refetchEntity)("refund_reason", req.params.id, req.scope, req.queryConfig.fields);
    res.json({ refund_reason });
};
exports.GET = GET;
const POST = async (req, res) => {
    const { id } = req.params;
    await (0, core_flows_1.updateRefundReasonsWorkflow)(req.scope).run({
        input: [
            {
                ...req.validatedBody,
                id,
            },
        ],
    });
    const refund_reason = await (0, http_1.refetchEntity)("refund_reason", req.params.id, req.scope, req.queryConfig.fields);
    res.json({ refund_reason });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const { id } = req.params;
    const input = { ids: [id] };
    await (0, core_flows_1.deleteRefundReasonsWorkflow)(req.scope).run({ input });
    res.json({
        id,
        object: "refund_reason",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map