"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCampaignPromotionsStep = exports.addCampaignPromotionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.addCampaignPromotionsStepId = "add-campaign-promotions";
/**
 * This step adds promotions to a campaign.
 *
 * @example
 * const data = addCampaignPromotionsStep({
 *   id: "camp_123",
 *   add: ["promo_123"],
 *   remove: ["promo_321"],
 * })
 */
exports.addCampaignPromotionsStep = (0, workflows_sdk_1.createStep)(exports.addCampaignPromotionsStepId, async (input, { container }) => {
    const { id: campaignId, add: promotionIdsToAdd = [] } = input;
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    if (promotionIdsToAdd.length) {
        await promotionModule.addPromotionsToCampaign({
            id: campaignId,
            promotion_ids: promotionIdsToAdd,
        });
    }
    return new workflows_sdk_1.StepResponse(null, input);
}, async (data, { container }) => {
    if (!data) {
        return;
    }
    const { id: campaignId, add: promotionIdsToRemove = [] } = data;
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    if (promotionIdsToRemove.length) {
        await promotionModule.removePromotionsFromCampaign({
            id: campaignId,
            promotion_ids: promotionIdsToRemove,
        });
    }
});
//# sourceMappingURL=add-campaign-promotions.js.map