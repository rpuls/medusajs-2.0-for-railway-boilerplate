"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "api_key",
        variables: {
            filters: req.filterableFields,
            ...req.queryConfig.pagination,
        },
        fields: req.queryConfig.fields,
    });
    const { rows: apiKeys, metadata } = await remoteQuery(queryObject);
    res.json({
        api_keys: apiKeys,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const input = [
        {
            ...req.validatedBody,
            created_by: req.auth_context.actor_id,
        },
    ];
    const { result } = await (0, core_flows_1.createApiKeysWorkflow)(req.scope).run({
        input: { api_keys: input },
    });
    // We should not refetch the api key here, as we need to show the secret key in the response (and never again)
    // And the only time we get to see the secret, is when we create it
    res.status(200).json({ api_key: result[0] });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map