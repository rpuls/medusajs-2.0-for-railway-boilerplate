"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const http_1 = require("@medusajs/framework/http");
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../../../helpers");
const GET = async (req, res) => {
    const productId = req.params.id;
    const optionId = req.params.option_id;
    const productOption = await (0, http_1.refetchEntity)("product_option", { id: optionId, product_id: productId }, req.scope, req.queryConfig.fields);
    res.status(200).json({ product_option: productOption });
};
exports.GET = GET;
const POST = async (req, res) => {
    const productId = req.params.id;
    const optionId = req.params.option_id;
    const { additional_data, ...update } = req.validatedBody;
    await (0, core_flows_1.updateProductOptionsWorkflow)(req.scope).run({
        input: {
            selector: { id: optionId, product_id: productId },
            update,
            additional_data,
        },
    });
    const product = await (0, http_1.refetchEntity)("product", productId, req.scope, (0, helpers_1.remapKeysForProduct)(req.queryConfig.fields ?? []));
    res.status(200).json({ product: (0, helpers_1.remapProductResponse)(product) });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const productId = req.params.id;
    const optionId = req.params.option_id;
    // TODO: I believe here we cannot even enforce the product ID based on the standard API we provide?
    await (0, core_flows_1.deleteProductOptionsWorkflow)(req.scope).run({
        input: { ids: [optionId] /* product_id: productId */ },
    });
    const product = await (0, http_1.refetchEntity)("product", productId, req.scope, (0, helpers_1.remapKeysForProduct)(req.queryConfig.fields ?? []));
    res.status(200).json({
        id: optionId,
        object: "product_option",
        deleted: true,
        parent: product,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map