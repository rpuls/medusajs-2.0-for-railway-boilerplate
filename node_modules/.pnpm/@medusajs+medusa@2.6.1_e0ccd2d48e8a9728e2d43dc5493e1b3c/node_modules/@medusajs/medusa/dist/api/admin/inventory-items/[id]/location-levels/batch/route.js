"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const POST = async (req, res) => {
    const { id } = req.params;
    const workflow = (0, core_flows_1.batchInventoryItemLevelsWorkflow)(req.scope);
    const output = await workflow.run({
        input: {
            delete: req.validatedBody.delete ?? [],
            create: req.validatedBody.create?.map((c) => ({
                ...c,
                inventory_item_id: id,
            })) ?? [],
            update: req.validatedBody.update?.map((u) => ({
                ...u,
                inventory_item_id: id,
            })) ?? [],
            force: req.validatedBody.force ?? false,
        },
    });
    res.status(200).json({
        created: output.result.created,
        updated: output.result.updated,
        deleted: output.result.deleted,
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map