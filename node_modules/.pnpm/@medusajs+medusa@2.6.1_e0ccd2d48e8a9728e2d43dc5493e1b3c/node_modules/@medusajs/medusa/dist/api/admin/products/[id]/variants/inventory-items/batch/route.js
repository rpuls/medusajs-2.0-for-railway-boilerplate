"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../../../../helpers");
const POST = async (req, res) => {
    const { create = [], update = [], delete: toDelete = [] } = req.validatedBody;
    const { result } = await (0, core_flows_1.batchLinksWorkflow)(req.scope).run({
        input: {
            create: (0, helpers_1.buildBatchVariantInventoryData)(create),
            update: (0, helpers_1.buildBatchVariantInventoryData)(update),
            delete: (0, helpers_1.buildBatchVariantInventoryData)(toDelete),
        },
    });
    res.status(200).json({
        created: result.created,
        updated: result.updated,
        deleted: result.deleted,
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map