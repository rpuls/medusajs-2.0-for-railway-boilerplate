"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
// TODO: Do we want to apply some sort of authentication here? My suggestion is that we do
const GET = async (req, res) => {
    const workflow = (0, core_flows_1.getOrderDetailWorkflow)(req.scope);
    const { result } = await workflow.run({
        input: {
            fields: req.queryConfig.fields,
            order_id: req.params.id,
            filters: {
                is_draft_order: false,
            },
        },
    });
    res.status(200).json({ order: result });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map