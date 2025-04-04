"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const middlewares_1 = require("../../../../utils/middlewares");
const http_1 = require("@medusajs/framework/http");
const helpers_1 = require("../../helpers");
const GET = async (req, res) => {
    const productId = req.params.id;
    const withInventoryQuantity = req.queryConfig.fields.some((field) => field.includes("inventory_quantity"));
    if (withInventoryQuantity) {
        req.queryConfig.fields = req.queryConfig.fields.filter((field) => !field.includes("inventory_quantity"));
    }
    const { rows: variants, metadata } = await (0, http_1.refetchEntities)("variant", { ...req.filterableFields, product_id: productId }, req.scope, (0, helpers_1.remapKeysForVariant)(req.queryConfig.fields ?? []), req.queryConfig.pagination);
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
const POST = async (req, res) => {
    const productId = req.params.id;
    const { additional_data, ...rest } = req.validatedBody;
    const input = [
        {
            ...rest,
            product_id: productId,
        },
    ];
    await (0, core_flows_1.createProductVariantsWorkflow)(req.scope).run({
        input: { product_variants: input, additional_data },
    });
    const product = await (0, http_1.refetchEntity)("product", productId, req.scope, (0, helpers_1.remapKeysForProduct)(req.queryConfig.fields ?? []));
    res.status(200).json({ product: (0, helpers_1.remapProductResponse)(product) });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map