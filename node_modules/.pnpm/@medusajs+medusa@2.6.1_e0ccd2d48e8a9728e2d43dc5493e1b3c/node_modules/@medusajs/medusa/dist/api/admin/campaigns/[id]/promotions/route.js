"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../../helpers");
const POST = async (req, res) => {
    const { id } = req.params;
    const { add, remove } = req.validatedBody;
    await (0, core_flows_1.addOrRemoveCampaignPromotionsWorkflow)(req.scope).run({
        input: { id, add, remove },
    });
    const campaign = await (0, helpers_1.refetchCampaign)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ campaign });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map