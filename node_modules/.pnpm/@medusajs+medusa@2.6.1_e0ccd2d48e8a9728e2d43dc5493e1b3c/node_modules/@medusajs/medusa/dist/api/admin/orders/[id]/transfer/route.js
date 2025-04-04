"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const variables = { id: req.params.id };
    await (0, core_flows_1.requestOrderTransferWorkflow)(req.scope).run({
        input: {
            order_id: req.params.id,
            customer_id: req.validatedBody.customer_id,
            logged_in_user: req.auth_context.actor_id,
            description: req.validatedBody.description,
            internal_note: req.validatedBody.internal_note,
        },
    });
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "order",
        variables,
        fields: req.queryConfig.fields,
    });
    const [order] = await remoteQuery(queryObject);
    res.status(200).json({ order });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map