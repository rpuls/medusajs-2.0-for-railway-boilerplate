"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const http_1 = require("@medusajs/framework/http");
const helpers_1 = require("../../../helpers");
const GET = async (req, res) => {
    const productId = req.params.id;
    const variantId = req.params.variant_id;
    const variables = { id: variantId, product_id: productId };
    const variant = await (0, http_1.refetchEntity)("variant", variables, req.scope, (0, helpers_1.remapKeysForVariant)(req.queryConfig.fields ?? []));
    res.status(200).json({ variant: (0, helpers_1.remapVariantResponse)(variant) });
};
exports.GET = GET;
const POST = async (req, res) => {
    const productId = req.params.id;
    const variantId = req.params.variant_id;
    const { additional_data, ...update } = req.validatedBody;
    await (0, core_flows_1.updateProductVariantsWorkflow)(req.scope).run({
        input: {
            selector: { id: variantId, product_id: productId },
            update: update,
            additional_data,
        },
    });
    const product = await (0, http_1.refetchEntity)("product", productId, req.scope, (0, helpers_1.remapKeysForProduct)(req.queryConfig.fields ?? []));
    res.status(200).json({ product: (0, helpers_1.remapProductResponse)(product) });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const productId = req.params.id;
    const variantId = req.params.variant_id;
    // TODO: I believe here we cannot even enforce the product ID based on the standard API we provide?
    await (0, core_flows_1.deleteProductVariantsWorkflow)(req.scope).run({
        input: { ids: [variantId] /* product_id: productId */ },
    });
    const product = await (0, http_1.refetchEntity)("product", productId, req.scope, (0, helpers_1.remapKeysForProduct)(req.queryConfig.fields ?? []));
    res.status(200).json({
        id: variantId,
        object: "variant",
        deleted: true,
        parent: (0, helpers_1.remapProductResponse)(product),
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map