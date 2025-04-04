"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const query_config_1 = require("../../../../returns/query-config");
const POST = async (req, res) => {
    const { id } = req.params;
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const [claim] = await remoteQuery((0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "order_claim",
        variables: {
            id,
        },
        fields: ["id", "return_id"],
    }), {
        throwIfKeyNotFound: true,
    });
    const { result } = await (0, core_flows_1.createClaimShippingMethodWorkflow)(req.scope).run({
        input: {
            ...req.validatedBody,
            return_id: claim.return_id,
            claim_id: id,
        },
    });
    const returnId = result.order_change.return_id;
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "return",
        variables: {
            id: returnId,
        },
        fields: query_config_1.defaultAdminDetailsReturnFields,
    });
    const [orderReturn] = await remoteQuery(queryObject);
    res.json({
        order_preview: result,
        return: orderReturn,
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map