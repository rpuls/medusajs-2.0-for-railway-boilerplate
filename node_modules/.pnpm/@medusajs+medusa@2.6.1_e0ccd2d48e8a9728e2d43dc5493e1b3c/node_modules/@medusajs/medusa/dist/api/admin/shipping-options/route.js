"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("./helpers");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "shipping_options",
        variables: {
            filters: req.filterableFields,
            ...req.queryConfig.pagination,
        },
        fields: req.queryConfig.fields,
    });
    const { rows: shipping_options, metadata } = await remoteQuery(queryObject);
    res.json({
        shipping_options,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const shippingOptionPayload = req.validatedBody;
    const workflow = (0, core_flows_1.createShippingOptionsWorkflow)(req.scope);
    const { result } = await workflow.run({
        input: [shippingOptionPayload],
    });
    const shippingOption = await (0, helpers_1.refetchShippingOption)(result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ shipping_option: shippingOption });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map