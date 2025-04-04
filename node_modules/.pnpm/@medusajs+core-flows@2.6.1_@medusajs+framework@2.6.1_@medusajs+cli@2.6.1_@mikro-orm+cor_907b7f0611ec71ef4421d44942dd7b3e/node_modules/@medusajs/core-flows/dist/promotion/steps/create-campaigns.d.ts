import { CreateCampaignDTO } from "@medusajs/framework/types";
export declare const createCampaignsStepId = "create-campaigns";
/**
 * This step cancels one or more campaigns.
 *
 * @example
 * const data = createCampaignsStep([
 *   {
 *     name: "Sale Campaign",
 *     campaign_identifier: "GA-123456"
 *   }
 * ])
 */
export declare const createCampaignsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateCampaignDTO[], import("@medusajs/framework/types").CampaignDTO[]>;
//# sourceMappingURL=create-campaigns.d.ts.map