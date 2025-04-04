"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const helpers_1 = require("../../../helpers");
const core_flows_1 = require("@medusajs/core-flows");
const POST = async (req, res) => {
    const id = req.params.id;
    const { result } = await (0, core_flows_1.batchShippingOptionRulesWorkflow)(req.scope).run({
        input: {
            create: req.validatedBody.create?.map((c) => ({
                ...c,
                shipping_option_id: id,
            })),
            update: req.validatedBody.update,
            delete: req.validatedBody.delete,
        },
    });
    const batchResults = await (0, helpers_1.refetchBatchRules)(result, req.scope, req.queryConfig.fields);
    res
        .status(200)
        .json(batchResults);
};
exports.POST = POST;
//# sourceMappingURL=route.js.map