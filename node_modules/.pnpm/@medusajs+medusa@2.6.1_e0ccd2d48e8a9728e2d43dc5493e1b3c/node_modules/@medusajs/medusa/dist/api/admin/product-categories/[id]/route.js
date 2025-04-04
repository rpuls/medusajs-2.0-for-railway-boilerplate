"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const http_1 = require("@medusajs/framework/http");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const [category] = await (0, http_1.refetchEntities)("product_category", { id: req.params.id, ...req.filterableFields }, req.scope, req.queryConfig.fields);
    if (!category) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Product category with id: ${req.params.id} was not found`);
    }
    res.json({ product_category: category });
};
exports.GET = GET;
const POST = async (req, res) => {
    const { id } = req.params;
    await (0, core_flows_1.updateProductCategoriesWorkflow)(req.scope).run({
        input: { selector: { id }, update: req.validatedBody },
    });
    const [category] = await (0, http_1.refetchEntities)("product_category", { id, ...req.filterableFields }, req.scope, req.queryConfig.fields);
    res.status(200).json({ product_category: category });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.id;
    await (0, core_flows_1.deleteProductCategoriesWorkflow)(req.scope).run({
        input: [id],
    });
    res.status(200).json({
        id,
        object: "product_category",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map