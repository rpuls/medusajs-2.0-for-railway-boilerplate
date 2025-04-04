"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("./helpers");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const query = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "product_collection",
        variables: {
            filters: req.filterableFields,
            ...req.queryConfig.pagination,
        },
        fields: req.queryConfig.fields,
    });
    const { rows: collections, metadata } = await remoteQuery(query);
    res.json({
        collections,
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
        },
    ];
    const { result } = await (0, core_flows_1.createCollectionsWorkflow)(req.scope).run({
        input: { collections: input },
    });
    const collection = await (0, helpers_1.refetchCollection)(result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ collection });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map