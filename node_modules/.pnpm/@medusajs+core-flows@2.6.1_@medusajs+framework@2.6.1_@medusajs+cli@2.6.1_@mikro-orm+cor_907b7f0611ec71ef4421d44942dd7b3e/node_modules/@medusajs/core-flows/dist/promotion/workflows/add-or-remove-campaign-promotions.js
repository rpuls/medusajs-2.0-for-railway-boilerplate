"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOrRemoveCampaignPromotionsWorkflow = exports.addOrRemoveCampaignPromotionsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.addOrRemoveCampaignPromotionsWorkflowId = "add-or-remove-campaign-promotions";
/**
 * This workflow manages the promotions of a campaign. It's used by the
 * [Manage Promotions Admin API Route](https://docs.medusajs.com/api/admin#campaigns_postcampaignsidpromotions).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * manage the promotions of a campaign within your custom flows.
 *
 * @example
 * const { result } = await addOrRemoveCampaignPromotionsWorkflow(container)
 * .run({
 *   input: {
 *     id: "camp_123",
 *     add: ["promo_123"],
 *     remove: ["promo_321"]
 *   }
 * })
 *
 * @summary
 *
 * Manage the promotions of a campaign.
 */
exports.addOrRemoveCampaignPromotionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.addOrRemoveCampaignPromotionsWorkflowId, (input) => {
    (0, workflows_sdk_1.parallelize)((0, steps_1.addCampaignPromotionsStep)(input), (0, steps_1.removeCampaignPromotionsStep)(input));
});
//# sourceMappingURL=add-or-remove-campaign-promotions.js.map