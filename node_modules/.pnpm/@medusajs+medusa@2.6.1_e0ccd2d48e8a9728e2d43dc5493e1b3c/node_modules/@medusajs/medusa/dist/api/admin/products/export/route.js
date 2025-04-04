"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const helpers_1 = require("../helpers");
const core_flows_1 = require("@medusajs/core-flows");
const POST = async (req, res) => {
    const selectFields = (0, helpers_1.remapKeysForProduct)(req.queryConfig.fields ?? []);
    const input = { select: selectFields, filter: req.filterableFields };
    const { transaction } = await (0, core_flows_1.exportProductsWorkflow)(req.scope).run({
        input,
    });
    res.status(202).json({ transaction_id: transaction.transactionId });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map