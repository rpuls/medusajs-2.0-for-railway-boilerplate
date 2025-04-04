"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../../helpers");
const buildLinks = (id, fulfillmentProviderIds) => {
    return fulfillmentProviderIds.map((fulfillmentProviderId) => ({
        [utils_1.Modules.STOCK_LOCATION]: { stock_location_id: id },
        [utils_1.Modules.FULFILLMENT]: {
            fulfillment_provider_id: fulfillmentProviderId,
        },
    }));
};
const POST = async (req, res) => {
    const { id } = req.params;
    const { add = [], remove = [] } = req.validatedBody;
    await (0, core_flows_1.batchLinksWorkflow)(req.scope).run({
        input: {
            create: buildLinks(id, add),
            delete: buildLinks(id, remove),
        },
    });
    const stockLocation = await (0, helpers_1.refetchStockLocation)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ stock_location: stockLocation });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map