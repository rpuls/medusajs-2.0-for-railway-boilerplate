"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCampaignsWorkflow = exports.deleteCampaignsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.deleteCampaignsWorkflowId = "delete-campaigns";
/**
 * This workflow deletes one or more campaigns. It's used by the
 * [Delete Campaign Admin API Route](https://docs.medusajs.com/api/admin#campaigns_deletecampaignsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * delete campaigns within your custom flows.
 *
 * @example
 * const { result } = await deleteCampaignsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["camp_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more campaigns.
 */
exports.deleteCampaignsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteCampaignsWorkflowId, (input) => {
    const deletedCampaigns = (0, steps_1.deleteCampaignsStep)(input.ids);
    const campaignsDeleted = (0, workflows_sdk_1.createHook)("campaignsDeleted", {
        ids: input.ids,
    });
    return new workflows_sdk_1.WorkflowResponse(deletedCampaigns, {
        hooks: [campaignsDeleted],
    });
});
//# sourceMappingURL=delete-campaigns.js.map