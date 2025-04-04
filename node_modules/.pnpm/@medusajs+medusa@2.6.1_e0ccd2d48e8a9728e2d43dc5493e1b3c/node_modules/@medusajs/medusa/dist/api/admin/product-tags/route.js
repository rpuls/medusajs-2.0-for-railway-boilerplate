"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const http_1 = require("@medusajs/framework/http");
const core_flows_1 = require("@medusajs/core-flows");
const GET = async (req, res) => {
    const { rows: product_tags, metadata } = await (0, http_1.refetchEntities)("product_tag", req.filterableFields, req.scope, req.queryConfig.fields, req.queryConfig.pagination);
    res.json({
        product_tags: product_tags,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const input = [req.validatedBody];
    const { result } = await (0, core_flows_1.createProductTagsWorkflow)(req.scope).run({
        input: { product_tags: input },
    });
    const productTag = await (0, http_1.refetchEntity)("product_tag", result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ product_tag: productTag });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map