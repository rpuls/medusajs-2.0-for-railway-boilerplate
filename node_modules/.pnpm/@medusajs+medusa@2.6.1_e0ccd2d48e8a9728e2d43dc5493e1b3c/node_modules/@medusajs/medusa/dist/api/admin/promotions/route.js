"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("./helpers");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "promotion",
        variables: {
            filters: req.filterableFields,
            ...req.queryConfig.pagination,
        },
        fields: req.queryConfig.fields,
    });
    const { rows: promotions, metadata } = await remoteQuery(queryObject);
    res.json({
        promotions,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const { additional_data, ...rest } = req.validatedBody;
    const createPromotions = (0, core_flows_1.createPromotionsWorkflow)(req.scope);
    const promotionsData = [rest];
    const { result } = await createPromotions.run({
        input: { promotionsData, additional_data },
    });
    const promotion = await (0, helpers_1.refetchPromotion)(result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ promotion });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map