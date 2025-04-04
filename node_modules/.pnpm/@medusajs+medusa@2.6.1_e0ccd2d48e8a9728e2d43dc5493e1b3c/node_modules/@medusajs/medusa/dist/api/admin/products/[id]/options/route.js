"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const http_1 = require("@medusajs/framework/http");
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../../helpers");
const GET = async (req, res) => {
    const productId = req.params.id;
    const { rows: product_options, metadata } = await (0, http_1.refetchEntities)("product_option", { ...req.filterableFields, product_id: productId }, req.scope, req.queryConfig.fields, req.queryConfig.pagination);
    res.json({
        product_options,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const productId = req.params.id;
    const { additional_data, ...rest } = req.validatedBody;
    await (0, core_flows_1.createProductOptionsWorkflow)(req.scope).run({
        input: {
            product_options: [
                {
                    ...rest,
                    product_id: productId,
                },
            ],
            additional_data,
        },
    });
    const product = await (0, http_1.refetchEntity)("product", productId, req.scope, (0, helpers_1.remapKeysForProduct)(req.queryConfig.fields ?? []));
    res.status(200).json({ product: (0, helpers_1.remapProductResponse)(product) });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map