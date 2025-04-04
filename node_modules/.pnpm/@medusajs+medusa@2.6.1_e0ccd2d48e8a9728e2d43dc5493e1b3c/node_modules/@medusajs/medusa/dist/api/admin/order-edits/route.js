"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const POST = async (req, res) => {
    const input = req.validatedBody;
    const workflow = (0, core_flows_1.beginOrderEditOrderWorkflow)(req.scope);
    const { result } = await workflow.run({
        input,
    });
    res.json({
        order_change: result,
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map