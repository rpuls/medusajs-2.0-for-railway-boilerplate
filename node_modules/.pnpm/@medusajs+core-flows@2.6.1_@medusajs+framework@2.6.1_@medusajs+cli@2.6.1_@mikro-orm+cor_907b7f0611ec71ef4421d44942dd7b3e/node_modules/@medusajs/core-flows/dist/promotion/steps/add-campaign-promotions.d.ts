import { LinkWorkflowInput } from "@medusajs/framework/types";
import { WorkflowData } from "@medusajs/framework/workflows-sdk";
export declare const addCampaignPromotionsStepId = "add-campaign-promotions";
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
export declare const addCampaignPromotionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<WorkflowData<LinkWorkflowInput>, null>;
//# sourceMappingURL=add-campaign-promotions.d.ts.map