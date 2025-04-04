"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const http_1 = require("@medusajs/framework/http");
const middlewares_1 = require("../../utils/middlewares");
const helpers_1 = require("../products/helpers");
const GET = async (req, res) => {
    const withInventoryQuantity = req.queryConfig.fields.some((field) => field.includes("inventory_quantity"));
    if (withInventoryQuantity) {
        req.queryConfig.fields = req.queryConfig.fields.filter((field) => !field.includes("inventory_quantity"));
    }
    const { rows: variants, metadata } = await (0, http_1.refetchEntities)("variant", { ...req.filterableFields }, req.scope, (0, helpers_1.remapKeysForVariant)(req.queryConfig.fields ?? []), req.queryConfig.pagination);
    if (withInventoryQuantity) {
        await (0, middlewares_1.wrapVariantsWithTotalInventoryQuantity)(req, variants || []);
    }
    res.json({
        variants: variants.map(helpers_1.remapVariantResponse),
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map