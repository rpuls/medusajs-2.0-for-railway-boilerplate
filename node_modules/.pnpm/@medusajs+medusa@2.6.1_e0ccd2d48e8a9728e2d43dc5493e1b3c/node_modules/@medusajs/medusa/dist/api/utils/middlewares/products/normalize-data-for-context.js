"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDataForContext = normalizeDataForContext;
const utils_1 = require("@medusajs/framework/utils");
const http_1 = require("@medusajs/framework/http");
function normalizeDataForContext() {
    return async (req, _, next) => {
        // If the product pricing is not requested, we don't need region information
        let withCalculatedPrice = req.queryConfig.fields.some((field) => field.startsWith("variants.calculated_price"));
        // If the region is passed, we calculate the prices without requesting them.
        // TODO: This seems a bit messy, reconsider if we want to keep this logic.
        if (!withCalculatedPrice && req.filterableFields.region_id) {
            req.queryConfig.fields.push("variants.calculated_price.*");
            withCalculatedPrice = true;
        }
        if (!withCalculatedPrice) {
            return next();
        }
        // Region ID is required to calculate prices correctly.
        // Country code, and optionally province, are needed to calculate taxes.
        let regionId = req.filterableFields.region_id;
        let countryCode = req.filterableFields.country_code;
        let province = req.filterableFields.province;
        // If the cart is passed, get the information from it
        if (req.filterableFields.cart_id) {
            const cart = await (0, http_1.refetchEntity)("cart", req.filterableFields.cart_id, req.scope, ["region_id", "shipping_address.*"]);
            if (cart?.region_id) {
                regionId = cart.region_id;
            }
            if (cart?.shipping_address) {
                countryCode = cart.shipping_address.country_code;
                province = cart.shipping_address.province;
            }
        }
        // Finally, try to get it from the store defaults if not available
        if (!regionId) {
            const stores = await (0, http_1.refetchEntities)("store", {}, req.scope, [
                "default_region_id",
            ]);
            regionId = stores[0]?.default_region_id;
        }
        if (!regionId) {
            try {
                throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Missing required pricing context to calculate prices - region_id`);
            }
            catch (e) {
                return next(e);
            }
        }
        req.filterableFields.region_id = regionId;
        req.filterableFields.country_code = countryCode;
        req.filterableFields.province = province;
        return next();
    };
}
//# sourceMappingURL=normalize-data-for-context.js.map