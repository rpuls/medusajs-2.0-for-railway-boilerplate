"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "return_reason",
        variables: {
            filters: {
                ...req.filterableFields,
            },
            ...req.queryConfig.pagination,
        },
        fields: req.queryConfig.fields,
    });
    const { rows: return_reasons, metadata } = await remoteQuery(queryObject);
    res.json({
        return_reasons,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const workflow = (0, core_flows_1.createReturnReasonsWorkflow)(req.scope);
    const input = {
        data: [
            {
                ...req.validatedBody,
            },
        ],
    };
    const { result } = await workflow.run({ input });
    const variables = { id: result[0].id };
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "return_reason",
        variables,
        fields: req.queryConfig.fields,
    });
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const [return_reason] = await remoteQuery(queryObject);
    res.json({ return_reason });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map