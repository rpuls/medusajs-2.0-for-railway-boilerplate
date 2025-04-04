"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const POST = async (req, res) => {
    const { id, item_id } = req.params;
    const { result } = await (0, core_flows_1.orderEditUpdateItemQuantityWorkflow)(req.scope).run({
        input: {
            ...req.validatedBody,
            order_id: id,
            items: [
                {
                    ...req.validatedBody,
                    id: item_id,
                },
            ],
        },
    });
    res.json({
        order_preview: result,
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map