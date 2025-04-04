"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const POST = async (req, res) => {
    const { id } = req.params;
    const { result } = await (0, core_flows_1.confirmOrderEditRequestWorkflow)(req.scope).run({
        input: {
            order_id: id,
            confirmed_by: req.auth_context.actor_id,
        },
    });
    res.json({
        order_preview: result,
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map