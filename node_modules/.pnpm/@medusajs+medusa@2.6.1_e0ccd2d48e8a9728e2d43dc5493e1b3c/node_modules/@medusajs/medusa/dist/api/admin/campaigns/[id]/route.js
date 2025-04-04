"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../helpers");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const campaign = await (0, helpers_1.refetchCampaign)(req.params.id, req.scope, req.queryConfig.fields);
    if (!campaign) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Campaign with id: ${req.params.id} was not found`);
    }
    res.status(200).json({ campaign });
};
exports.GET = GET;
const POST = async (req, res) => {
    const existingCampaign = await (0, helpers_1.refetchCampaign)(req.params.id, req.scope, [
        "id",
    ]);
    if (!existingCampaign) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Campaign with id "${req.params.id}" not found`);
    }
    const { additional_data, ...rest } = req.validatedBody;
    const updateCampaigns = (0, core_flows_1.updateCampaignsWorkflow)(req.scope);
    const campaignsData = [
        {
            id: req.params.id,
            ...rest,
        },
    ];
    await updateCampaigns.run({
        input: { campaignsData, additional_data },
    });
    const campaign = await (0, helpers_1.refetchCampaign)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ campaign });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.id;
    const deleteCampaigns = (0, core_flows_1.deleteCampaignsWorkflow)(req.scope);
    await deleteCampaigns.run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "campaign",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map