"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
// TODO: Add more fields to provider, such as default name and maybe logo.
const GET = async (req, res) => {
    if (!req.filterableFields.region_id) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "You must provide the region_id to list payment providers");
    }
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "region_payment_provider",
        variables: {
            filters: {
                region_id: req.filterableFields.region_id,
            },
            ...req.queryConfig.pagination,
        },
        fields: req.queryConfig.fields.map((f) => `payment_provider.${f}`),
    });
    const { rows: regionPaymentProvidersRelation, metadata } = await remoteQuery(queryObject);
    const paymentProviders = regionPaymentProvidersRelation.map((relation) => relation.payment_provider);
    res.json({
        payment_providers: paymentProviders,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map