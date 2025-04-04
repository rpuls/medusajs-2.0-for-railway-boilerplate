"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../../helpers");
const POST = async (req, res) => {
    await (0, core_flows_1.createTaxRateRulesWorkflow)(req.scope).run({
        input: {
            rules: [
                {
                    ...req.validatedBody,
                    tax_rate_id: req.params.id,
                    created_by: req.auth_context.actor_id,
                },
            ],
        },
    });
    const taxRate = await (0, helpers_1.refetchTaxRate)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ tax_rate: taxRate });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map