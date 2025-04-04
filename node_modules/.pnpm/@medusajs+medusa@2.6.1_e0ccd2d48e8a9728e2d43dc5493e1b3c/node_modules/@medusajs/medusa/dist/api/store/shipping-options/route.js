"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const GET = async (req, res) => {
    const { cart_id, is_return } = req.filterableFields;
    const workflow = (0, core_flows_1.listShippingOptionsForCartWorkflow)(req.scope);
    const { result: shipping_options } = await workflow.run({
        input: { cart_id, is_return: !!is_return },
    });
    res.json({ shipping_options });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map