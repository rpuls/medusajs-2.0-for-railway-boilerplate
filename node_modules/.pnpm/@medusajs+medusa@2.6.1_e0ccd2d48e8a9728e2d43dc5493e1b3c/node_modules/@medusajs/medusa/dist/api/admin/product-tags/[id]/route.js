"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const http_1 = require("@medusajs/framework/http");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const productTag = await (0, http_1.refetchEntity)("product_tag", req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ product_tag: productTag });
};
exports.GET = GET;
const POST = async (req, res) => {
    const existingProductTag = await (0, http_1.refetchEntity)("product_tag", req.params.id, req.scope, ["id"]);
    if (!existingProductTag) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Product tag with id "${req.params.id}" not found`);
    }
    const { result } = await (0, core_flows_1.updateProductTagsWorkflow)(req.scope).run({
        input: {
            selector: { id: req.params.id },
            update: req.validatedBody,
        },
    });
    const productTag = await (0, http_1.refetchEntity)("product_tag", result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ product_tag: productTag });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.id;
    await (0, core_flows_1.deleteProductTagsWorkflow)(req.scope).run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "product_tag",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map