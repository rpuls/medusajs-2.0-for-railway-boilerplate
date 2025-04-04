"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCampaignsStep = exports.updateCampaignsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateCampaignsStepId = "update-campaigns";
/**
 * This step updates one or more campaigns.
 *
 * @example
 * const data = updateCampaignsStep([{
 *   id: "camp_123",
 *   campaign_identifier: "GA-123456"
 * }])
 */
exports.updateCampaignsStep = (0, workflows_sdk_1.createStep)(exports.updateCampaignsStepId, async (data, { container }) => {
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)(data);
    const dataBeforeUpdate = await promotionModule.listCampaigns({ id: data.map((d) => d.id) }, { relations, select: selects });
    const updatedCampaigns = await promotionModule.updateCampaigns(data);
    return new workflows_sdk_1.StepResponse(updatedCampaigns, {
        dataBeforeUpdate,
        selects,
        relations,
    });
}, async (revertInput, { container }) => {
    if (!revertInput) {
        return;
    }
    const { dataBeforeUpdate, selects, relations } = revertInput;
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    await promotionModule.updateCampaigns(dataBeforeUpdate.map((data) => (0, utils_1.convertItemResponseToUpdateRequest)(data, selects, relations)));
});
//# sourceMappingURL=update-campaigns.js.map