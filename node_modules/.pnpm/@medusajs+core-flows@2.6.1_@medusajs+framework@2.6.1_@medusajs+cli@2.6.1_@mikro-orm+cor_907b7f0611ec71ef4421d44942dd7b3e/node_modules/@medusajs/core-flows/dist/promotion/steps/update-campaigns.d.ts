import { UpdateCampaignDTO } from "@medusajs/framework/types";
export declare const updateCampaignsStepId = "update-campaigns";
/**
 * This step updates one or more campaigns.
 *
 * @example
 * const data = updateCampaignsStep([{
 *   id: "camp_123",
 *   campaign_identifier: "GA-123456"
 * }])
 */
export declare const updateCampaignsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateCampaignDTO[], import("@medusajs/framework/types").CampaignDTO[]>;
//# sourceMappingURL=update-campaigns.d.ts.map