"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterByValidSalesChannels = filterByValidSalesChannels;
const utils_1 = require("@medusajs/framework/utils");
// Selection of sales channels happens in the following priority:
// - If a publishable API key is passed, we take the sales channels attached to it and filter them down based on the query params
// - If a sales channel id is passed through query params, we use that
// - If not, we use the default sales channel for the store
function filterByValidSalesChannels() {
    return async (req, _, next) => {
        const idsFromRequest = req.filterableFields.sales_channel_id;
        const { sales_channel_ids: idsFromPublishableKey = [] } = req.publishable_key_context;
        // If all sales channel ids are not in the publishable key, we throw an error
        if (Array.isArray(idsFromRequest) && idsFromRequest.length) {
            const uniqueInParams = (0, utils_1.arrayDifference)(idsFromRequest, idsFromPublishableKey);
            if (uniqueInParams.length) {
                return next(new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Requested sales channel is not part of the publishable key`));
            }
            req.filterableFields.sales_channel_id = idsFromRequest;
            return next();
        }
        if (idsFromPublishableKey?.length) {
            req.filterableFields.sales_channel_id = idsFromPublishableKey;
            return next();
        }
        return next(new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Publishable key needs to have a sales channel configured`));
    };
}
//# sourceMappingURL=filter-by-valid-sales-channels.js.map