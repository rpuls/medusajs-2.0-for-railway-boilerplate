"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../helpers");
const POST = async (req, res) => {
    const { result } = await (0, core_flows_1.batchProductsWorkflow)(req.scope).run({
        input: req.validatedBody,
    });
    const batchResults = await (0, helpers_1.refetchBatchProducts)(result, req.scope, req.queryConfig.fields);
    res.status(200).json({
        created: batchResults.created.map(helpers_1.remapProductResponse),
        updated: batchResults.updated.map(helpers_1.remapProductResponse),
        deleted: batchResults.deleted,
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map