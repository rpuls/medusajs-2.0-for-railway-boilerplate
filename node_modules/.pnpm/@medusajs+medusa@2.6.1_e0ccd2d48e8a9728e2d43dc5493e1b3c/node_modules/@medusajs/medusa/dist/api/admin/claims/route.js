"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "order_claims",
        variables: {
            filters: {
                ...req.filterableFields,
            },
            ...req.queryConfig.pagination,
        },
        fields: req.queryConfig.fields,
    });
    const { rows: claims, metadata } = await remoteQuery(queryObject);
    res.json({
        claims,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const input = {
        ...req.validatedBody,
        created_by: req.auth_context.actor_id,
    };
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const orderModuleService = req.scope.resolve(utils_1.Modules.ORDER);
    const workflow = (0, core_flows_1.beginClaimOrderWorkflow)(req.scope);
    const { result } = await workflow.run({
        input,
    });
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "order_claim",
        variables: {
            id: result.claim_id,
            filters: {
                ...req.filterableFields,
            },
        },
        fields: req.queryConfig.fields,
    });
    const [order, orderClaim] = await (0, utils_1.promiseAll)([
        orderModuleService.retrieveOrder(result.order_id),
        remoteQuery(queryObject),
    ]);
    res.json({
        order,
        claim: orderClaim[0],
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map