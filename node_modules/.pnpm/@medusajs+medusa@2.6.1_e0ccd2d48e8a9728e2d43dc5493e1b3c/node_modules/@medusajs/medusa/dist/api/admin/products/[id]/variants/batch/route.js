"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../../../helpers");
const POST = async (req, res) => {
    const productId = req.params.id;
    const normalizedInput = {
        create: req.validatedBody.create?.map((c) => ({
            ...c,
            product_id: productId,
        })),
        update: req.validatedBody.update?.map((u) => ({
            ...u,
            product_id: productId,
        })),
        delete: req.validatedBody.delete,
    };
    const { result } = await (0, core_flows_1.batchProductVariantsWorkflow)(req.scope).run({
        input: normalizedInput,
    });
    const batchResults = await (0, helpers_1.refetchBatchVariants)(result, req.scope, req.queryConfig.fields);
    res.status(200).json({
        created: batchResults.created.map(helpers_1.remapVariantResponse),
        updated: batchResults.updated.map(helpers_1.remapVariantResponse),
        deleted: batchResults.deleted,
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map