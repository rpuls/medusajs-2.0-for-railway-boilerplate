"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    const { id } = req.params;
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const { result } = await (0, core_flows_1.createClaimShippingMethodWorkflow)(req.scope).run({
        input: { ...req.validatedBody, claim_id: id },
    });
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "order_claim",
        variables: {
            id,
            filters: {
                ...req.filterableFields,
            },
        },
        fields: req.queryConfig.fields,
    });
    const [orderClaim] = await remoteQuery(queryObject);
    res.json({
        order_preview: result,
        claim: orderClaim,
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map