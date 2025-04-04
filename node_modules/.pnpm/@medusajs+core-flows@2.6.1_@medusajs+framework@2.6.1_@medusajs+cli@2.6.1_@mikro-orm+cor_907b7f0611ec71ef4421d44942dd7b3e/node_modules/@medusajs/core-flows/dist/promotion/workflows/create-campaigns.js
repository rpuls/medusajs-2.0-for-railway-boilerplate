"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCampaignsWorkflow = exports.createCampaignsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.createCampaignsWorkflowId = "create-campaigns";
/**
 * This workflow creates one or more campaigns. It's used by the [Create Campaign Admin API Route](https://docs.medusajs.com/api/admin#campaigns_postcampaigns).
 *
 * This workflow has a hook that allows you to perform custom actions on the created campaigns. For example, you can pass under `additional_data` custom data that
 * allows you to create custom data models linked to the campaigns.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around creating campaigns.
 *
 * @example
 * const { result } = await createCampaignsWorkflow(container)
 * .run({
 *   input: {
 *     campaignsData: [
 *       {
 *         name: "Launch Promotions",
 *         campaign_identifier: "GA-123456",
 *         starts_at: new Date("2025-01-01"),
 *         ends_at: new Date("2026-01-01"),
 *         budget: {
 *           type: "usage",
 *           limit: 100,
 *         }
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
 * Create one or more campaigns.
 *
 * @property hooks.campaignsCreated - This hook is executed after the campaigns are created. You can consume this hook to perform custom actions on the created campaigns.
 */
exports.createCampaignsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createCampaignsWorkflowId, (input) => {
    const createdCampaigns = (0, steps_1.createCampaignsStep)(input.campaignsData);
    const campaignsCreated = (0, workflows_sdk_1.createHook)("campaignsCreated", {
        campaigns: createdCampaigns,
        additional_data: input.additional_data,
    });
    return new workflows_sdk_1.WorkflowResponse(createdCampaigns, {
        hooks: [campaignsCreated],
    });
});
//# sourceMappingURL=create-campaigns.js.map