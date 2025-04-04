"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.POST = void 0;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("./helpers");
// Create stock location
const POST = async (req, res) => {
    const { result } = await (0, core_flows_1.createStockLocationsWorkflow)(req.scope).run({
        input: { locations: [req.validatedBody] },
    });
    const stockLocation = await (0, helpers_1.refetchStockLocation)(result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ stock_location: stockLocation });
};
exports.POST = POST;
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const { rows: stock_locations, metadata } = await remoteQuery((0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "stock_locations",
        variables: {
            filters: req.filterableFields,
            ...req.queryConfig.pagination,
        },
        fields: req.queryConfig.fields,
    }));
    res.status(200).json({
        stock_locations,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map