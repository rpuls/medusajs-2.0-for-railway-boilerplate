"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCampaignPromotionsStep = exports.removeCampaignPromotionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.removeCampaignPromotionsStepId = "remove-campaign-promotions";
/**
 * This step removes promotions from a campaigns.
 *
 * @example
 * const data = removeCampaignPromotionsStep([
 *   {
 *     id: "camp_123",
 *     remove: ["promo_321"]
 *   }
 * ])
 */
exports.removeCampaignPromotionsStep = (0, workflows_sdk_1.createStep)(exports.removeCampaignPromotionsStepId, async (input, { container }) => {
    const { id: campaignId, remove: promotionIdsToRemove = [] } = input;
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
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
    const { id: campaignId, remove: promotionIdsToAdd = [] } = data;
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    if (promotionIdsToAdd.length) {
        await promotionModule.addPromotionsToCampaign({
            id: campaignId,
            promotion_ids: promotionIdsToAdd,
        });
    }
});
//# sourceMappingURL=remove-campaign-promotions.js.map