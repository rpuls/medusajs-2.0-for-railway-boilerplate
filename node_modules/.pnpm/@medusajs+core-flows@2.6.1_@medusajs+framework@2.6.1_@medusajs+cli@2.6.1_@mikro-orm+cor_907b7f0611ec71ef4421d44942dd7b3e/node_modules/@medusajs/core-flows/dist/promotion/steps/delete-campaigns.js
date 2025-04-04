"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCampaignsStep = exports.deleteCampaignsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteCampaignsStepId = "delete-campaigns";
/**
 * This step deletes one or more campaigns.
 */
exports.deleteCampaignsStep = (0, workflows_sdk_1.createStep)(exports.deleteCampaignsStepId, async (ids, { container }) => {
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    await promotionModule.softDeleteCampaigns(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (idsToRestore, { container }) => {
    if (!idsToRestore?.length) {
        return;
    }
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    await promotionModule.restoreCampaigns(idsToRestore);
});
//# sourceMappingURL=delete-campaigns.js.map