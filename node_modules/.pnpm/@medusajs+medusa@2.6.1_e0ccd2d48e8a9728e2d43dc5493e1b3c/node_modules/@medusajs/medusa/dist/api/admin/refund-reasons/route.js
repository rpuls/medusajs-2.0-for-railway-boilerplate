"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const http_1 = require("@medusajs/framework/http");
const GET = async (req, res) => {
    const { rows: refund_reasons, metadata } = await (0, http_1.refetchEntities)("refund_reasons", req.filterableFields, req.scope, req.queryConfig.fields, req.queryConfig.pagination);
    res.json({
        refund_reasons,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const { result: [refundReason], } = await (0, core_flows_1.createRefundReasonsWorkflow)(req.scope).run({
        input: { data: [req.validatedBody] },
    });
    const refund_reason = await (0, http_1.refetchEntity)("refund_reason", refundReason.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ refund_reason });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map