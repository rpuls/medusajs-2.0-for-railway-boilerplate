"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("./helpers");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "sales_channels",
        variables: {
            filters: req.filterableFields,
            ...req.queryConfig.pagination,
        },
        fields: req.queryConfig.fields,
    });
    const { rows: sales_channels, metadata } = await remoteQuery(queryObject);
    res.json({
        sales_channels,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const salesChannelsData = [req.validatedBody];
    const { result } = await (0, core_flows_1.createSalesChannelsWorkflow)(req.scope).run({
        input: { salesChannelsData },
    });
    const salesChannel = await (0, helpers_1.refetchSalesChannel)(result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ sales_channel: salesChannel });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map