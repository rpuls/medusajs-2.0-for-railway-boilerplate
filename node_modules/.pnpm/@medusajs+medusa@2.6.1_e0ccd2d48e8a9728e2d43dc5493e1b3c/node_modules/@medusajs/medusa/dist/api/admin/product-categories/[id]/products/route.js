"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const http_1 = require("@medusajs/framework/http");
const POST = async (req, res) => {
    const { id } = req.params;
    await (0, core_flows_1.batchLinkProductsToCategoryWorkflow)(req.scope).run({
        input: { id, ...req.validatedBody },
    });
    const category = await (0, http_1.refetchEntity)("product_category", id, req.scope, req.queryConfig.fields);
    res.status(200).json({ product_category: category });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map