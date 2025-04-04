"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("./helpers");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "product_type",
        variables: {
            filters: req.filterableFields,
            ...req.queryConfig.pagination,
        },
        fields: req.queryConfig.fields,
    });
    const { rows: product_types, metadata } = await remoteQuery(queryObject);
    res.json({
        product_types: product_types,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const input = [req.validatedBody];
    const { result } = await (0, core_flows_1.createProductTypesWorkflow)(req.scope).run({
        input: { product_types: input },
    });
    const productType = await (0, helpers_1.refetchProductType)(result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ product_type: productType });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map