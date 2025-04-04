"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCampaignsWorkflow = exports.updateCampaignsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.updateCampaignsWorkflowId = "update-campaigns";
/**
 * This workflow updates one or more campaigns. It's used by the [Update Campaign Admin API Route](https://docs.medusajs.com/api/admin#campaigns_postcampaignsid).
 *
 * This workflow has a hook that allows you to perform custom actions on the updated campaigns. For example, you can pass under `additional_data` custom data that
 * allows you to update custom data models linked to the campaigns.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around updating campaigns.
 *
 * @example
 * const { result } = await updateCampaignsWorkflow(container)
 * .run({
 *   input: {
 *     campaignsData: [
 *       {
 *         id: "camp_123",
 *         name: "Launch Promotions",
 *         ends_at: new Date("2026-01-01"),
 *       }
 *     ],
 *     additional_data: {
 *       target_audience: "new_customers"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update one or more campaigns.
 *
 * @property hooks.campaignsUpdated - This hook is executed after the campaigns are updated. You can consume this hook to perform custom actions on the updated campaigns.
 */
exports.updateCampaignsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateCampaignsWorkflowId, (input) => {
    const updatedCampaigns = (0, steps_1.updateCampaignsStep)(input.campaignsData);
    const campaignsUpdated = (0, workflows_sdk_1.createHook)("campaignsUpdated", {
        campaigns: updatedCampaigns,
        additional_data: input.additional_data,
    });
    return new workflows_sdk_1.WorkflowResponse(updatedCampaigns, {
        hooks: [campaignsUpdated],
    });
});
//# sourceMappingURL=update-campaigns.js.map