"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../../helpers");
const POST = async (req, res) => {
    const payload = req.validatedBody;
    await (0, core_flows_1.addShippingMethodToCartWorkflow)(req.scope).run({
        input: {
            options: [{ id: payload.option_id, data: payload.data }],
            cart_id: req.params.id,
        },
    });
    const cart = await (0, helpers_1.refetchCart)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ cart });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map