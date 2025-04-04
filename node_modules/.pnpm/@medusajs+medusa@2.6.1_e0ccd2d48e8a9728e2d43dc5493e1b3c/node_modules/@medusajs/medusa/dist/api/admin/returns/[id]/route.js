"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const { id } = req.params;
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "return",
        variables: {
            id,
            filters: {
                ...req.filterableFields,
            },
        },
        fields: req.queryConfig.fields,
    });
    const [orderReturn] = await remoteQuery(queryObject, {
        throwIfKeyNotFound: true,
    });
    res.json({
        return: orderReturn,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const { id } = req.params;
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const { result } = await (0, core_flows_1.updateReturnWorkflow)(req.scope).run({
        input: { return_id: id, ...req.validatedBody },
    });
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "return",
        variables: {
            id,
            filters: {
                ...req.filterableFields,
            },
        },
        fields: req.queryConfig.fields,
    });
    const [orderReturn] = await remoteQuery(queryObject);
    res.json({
        order_preview: result,
        return: orderReturn,
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map