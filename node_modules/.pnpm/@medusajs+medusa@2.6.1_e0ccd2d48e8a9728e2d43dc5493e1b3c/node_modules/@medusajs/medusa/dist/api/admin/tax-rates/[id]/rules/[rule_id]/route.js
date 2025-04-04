"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../../../helpers");
const DELETE = async (req, res) => {
    await (0, core_flows_1.deleteTaxRateRulesWorkflow)(req.scope).run({
        input: { ids: [req.params.rule_id] },
    });
    const taxRate = await (0, helpers_1.refetchTaxRate)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({
        id: req.params.rule_id,
        object: "tax_rate_rule",
        deleted: true,
        parent: taxRate,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map