"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeApplyPriceListsFilter = maybeApplyPriceListsFilter;
const utils_1 = require("@medusajs/framework/utils");
function maybeApplyPriceListsFilter() {
    return async function applyPriceListsFilter(req, _, next) {
        const filterableFields = req.filterableFields;
        if (!filterableFields.price_list_id) {
            return next();
        }
        const priceListIds = filterableFields.price_list_id;
        delete filterableFields.price_list_id;
        const queryObject = (0, utils_1.remoteQueryObjectFromString)({
            entryPoint: "price_list",
            fields: ["prices.price_set.variant.id"],
            variables: {
                id: priceListIds,
            },
        });
        const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
        const variantIds = [];
        const priceLists = await remoteQuery(queryObject);
        priceLists.forEach((priceList) => {
            priceList.prices?.forEach((price) => {
                const variantId = price.price_set?.variant?.id;
                if (variantId) {
                    variantIds.push(variantId);
                }
            });
        });
        filterableFields.variants = {
            ...(filterableFields.variants ?? {}),
            id: variantIds,
        };
        return next();
    };
}
//# sourceMappingURL=maybe-apply-price-lists-filter.js.map