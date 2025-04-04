"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCampaignsStep = exports.createCampaignsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createCampaignsStepId = "create-campaigns";
/**
 * This step cancels one or more campaigns.
 *
 * @example
 * const data = createCampaignsStep([
 *   {
 *     name: "Sale Campaign",
 *     campaign_identifier: "GA-123456"
 *   }
 * ])
 */
exports.createCampaignsStep = (0, workflows_sdk_1.createStep)(exports.createCampaignsStepId, async (data, { container }) => {
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    const createdCampaigns = await promotionModule.createCampaigns(data);
    return new workflows_sdk_1.StepResponse(createdCampaigns, createdCampaigns.map((createdCampaigns) => createdCampaigns.id));
}, async (createdCampaignIds, { container }) => {
    if (!createdCampaignIds?.length) {
        return;
    }
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    await promotionModule.deleteCampaigns(createdCampaignIds);
});
//# sourceMappingURL=create-campaigns.js.map