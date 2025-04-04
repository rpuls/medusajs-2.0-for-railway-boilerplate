"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../helpers");
const utils_1 = require("@medusajs/framework/utils");
const http_1 = require("@medusajs/framework/http");
const GET = async (req, res) => {
    const selectFields = (0, helpers_1.remapKeysForProduct)(req.queryConfig.fields ?? []);
    const product = await (0, http_1.refetchEntity)("product", req.params.id, req.scope, selectFields);
    if (!product) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Product not found");
    }
    res.status(200).json({ product: (0, helpers_1.remapProductResponse)(product) });
};
exports.GET = GET;
const POST = async (req, res) => {
    const { additional_data, ...update } = req.validatedBody;
    const existingProduct = await (0, http_1.refetchEntity)("product", req.params.id, req.scope, ["id"]);
    /**
     * Check if the product exists with the id or not before calling the workflow.
     */
    if (!existingProduct) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Product with id "${req.params.id}" not found`);
    }
    const { result } = await (0, core_flows_1.updateProductsWorkflow)(req.scope).run({
        input: {
            selector: { id: req.params.id },
            update,
            additional_data,
        },
    });
    const product = await (0, http_1.refetchEntity)("product", result[0].id, req.scope, (0, helpers_1.remapKeysForProduct)(req.queryConfig.fields ?? []));
    res.status(200).json({ product: (0, helpers_1.remapProductResponse)(product) });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.id;
    await (0, core_flows_1.deleteProductsWorkflow)(req.scope).run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "product",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map