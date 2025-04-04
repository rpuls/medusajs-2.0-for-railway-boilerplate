"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const POST = async (req, res) => {
    const body = req.validatedBody;
    const output = await (0, core_flows_1.batchInventoryItemLevelsWorkflow)(req.scope).run({
        input: body,
    });
    res.json({
        created: output.result.created,
        updated: output.result.updated,
        deleted: output.result.deleted,
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map