"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("./helpers");
const POST = async (req, res) => {
    const { result: fullfillment } = await (0, core_flows_1.createFulfillmentWorkflow)(req.scope).run({
        input: {
            ...req.validatedBody,
            created_by: req.auth_context.actor_id,
        },
    });
    const fulfillment = await (0, helpers_1.refetchFulfillment)(fullfillment.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ fulfillment });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map