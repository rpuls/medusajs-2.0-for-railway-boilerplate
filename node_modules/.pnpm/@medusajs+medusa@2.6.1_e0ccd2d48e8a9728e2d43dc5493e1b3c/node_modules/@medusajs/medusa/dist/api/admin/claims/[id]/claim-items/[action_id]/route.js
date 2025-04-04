"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    const { id, action_id } = req.params;
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const { result } = await (0, core_flows_1.updateClaimItemWorkflow)(req.scope).run({
        input: {
            data: { ...req.validatedBody },
            claim_id: id,
            action_id,
        },
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
const DELETE = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const { id, action_id } = req.params;
    const { result: orderPreview } = await (0, core_flows_1.removeItemClaimActionWorkflow)(req.scope).run({
        input: {
            claim_id: id,
            action_id,
        },
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
        order_preview: orderPreview,
        claim: orderClaim,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map