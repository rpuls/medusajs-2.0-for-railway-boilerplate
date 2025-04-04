"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../../../helpers");
const POST = async (req, res) => {
    const id = req.params.id;
    const { result } = await (0, core_flows_1.batchPromotionRulesWorkflow)(req.scope).run({
        input: {
            id,
            rule_type: utils_1.RuleType.TARGET_RULES,
            create: req.validatedBody.create,
            update: req.validatedBody.update,
            delete: req.validatedBody.delete,
        },
    });
    const batchResults = await (0, helpers_1.refetchBatchRules)(result, req.scope, req.queryConfig.fields);
    res.status(200).json(batchResults);
};
exports.POST = POST;
//# sourceMappingURL=route.js.map