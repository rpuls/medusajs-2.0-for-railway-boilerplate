"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const http_1 = require("@medusajs/framework/http");
const GET = async (req, res) => {
    const { rows: product_categories, metadata } = await (0, http_1.refetchEntities)("product_category", req.filterableFields, req.scope, req.queryConfig.fields, req.queryConfig.pagination);
    res.json({
        product_categories,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const { result } = await (0, core_flows_1.createProductCategoriesWorkflow)(req.scope).run({
        input: { product_categories: [req.validatedBody] },
    });
    const [category] = await (0, http_1.refetchEntities)("product_category", { id: result[0].id, ...req.filterableFields }, req.scope, req.queryConfig.fields);
    res.status(200).json({ product_category: category });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map