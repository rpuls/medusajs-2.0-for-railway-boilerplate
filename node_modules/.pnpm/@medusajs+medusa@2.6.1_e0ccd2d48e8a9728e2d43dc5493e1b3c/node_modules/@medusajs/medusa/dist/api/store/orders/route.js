"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const GET = async (req, res) => {
    const variables = {
        filters: {
            ...req.filterableFields,
            is_draft_order: false,
            customer_id: req.auth_context.actor_id,
        },
        ...req.queryConfig.pagination,
    };
    const workflow = (0, core_flows_1.getOrdersListWorkflow)(req.scope);
    const { result } = await workflow.run({
        input: {
            fields: req.queryConfig.fields,
            variables,
        },
    });
    const { rows, metadata } = result;
    res.json({
        orders: rows,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map