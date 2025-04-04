"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("./helpers");
const POST = async (req, res) => {
    const shippingProfilePayload = req.validatedBody;
    const { result } = await (0, core_flows_1.createShippingProfilesWorkflow)(req.scope).run({
        input: { data: [shippingProfilePayload] },
    });
    const shippingProfile = await (0, helpers_1.refetchShippingProfile)(result?.[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ shipping_profile: shippingProfile });
};
exports.POST = POST;
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const query = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "shipping_profiles",
        variables: {
            filters: req.filterableFields,
            ...req.queryConfig.pagination,
        },
        fields: req.queryConfig.fields,
    });
    const { rows: shippingProfiles, metadata } = await remoteQuery(query);
    res.status(200).json({
        shipping_profiles: shippingProfiles,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map