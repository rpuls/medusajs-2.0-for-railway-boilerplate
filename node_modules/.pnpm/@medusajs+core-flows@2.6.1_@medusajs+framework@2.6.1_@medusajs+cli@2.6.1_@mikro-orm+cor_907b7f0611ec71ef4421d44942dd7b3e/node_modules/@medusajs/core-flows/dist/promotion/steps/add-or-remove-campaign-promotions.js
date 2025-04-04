"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOrRemoveCampaignPromotionsStep = exports.addOrRemoveCampaignPromotionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.addOrRemoveCampaignPromotionsStepId = "add-or-remove-campaign-promotions";
/**
 * This step adds or removes promotions from a campaign.
 */
exports.addOrRemoveCampaignPromotionsStep = (0, workflows_sdk_1.createStep)(exports.addOrRemoveCampaignPromotionsStepId, async (input, { container }) => {
    const { id: campaignId, add: promotionIdsToAdd = [], remove: promotionIdsToRemove = [], } = input;
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    if (promotionIdsToAdd.length) {
        await promotionModule.addPromotionsToCampaign({
            id: campaignId,
            promotion_ids: promotionIdsToAdd,
        });
    }
    if (promotionIdsToRemove.length) {
        await promotionModule.removePromotionsFromCampaign({
            id: campaignId,
            promotion_ids: promotionIdsToRemove,
        });
    }
    return new workflows_sdk_1.StepResponse(null, input);
}, async (data, { container }) => {
    if (!data) {
        return;
    }
    const { id: campaignId, add: promotionIdsToRemove = [], remove: promotionIdsToAdd = [], } = data;
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    if (promotionIdsToAdd.length) {
        promotionModule.addPromotionsToCampaign({
            id: campaignId,
            promotion_ids: promotionIdsToAdd,
        });
    }
    if (promotionIdsToRemove.length) {
        promotionModule.removePromotionsFromCampaign({
            id: campaignId,
            promotion_ids: promotionIdsToRemove,
        });
    }
});
//# sourceMappingURL=add-or-remove-campaign-promotions.js.map