"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("./helpers");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "price_list",
        variables: {
            filters: req.filterableFields,
            ...req.queryConfig.pagination,
        },
        fields: req.queryConfig.fields,
    });
    const { rows: priceLists, metadata } = await remoteQuery(queryObject);
    res.json({
        price_lists: priceLists.map((priceList) => (0, helpers_1.transformPriceList)(priceList)),
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const workflow = (0, core_flows_1.createPriceListsWorkflow)(req.scope);
    const { result } = await workflow.run({
        input: { price_lists_data: [req.validatedBody] },
    });
    const price_list = await (0, helpers_1.fetchPriceList)(result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ price_list });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map