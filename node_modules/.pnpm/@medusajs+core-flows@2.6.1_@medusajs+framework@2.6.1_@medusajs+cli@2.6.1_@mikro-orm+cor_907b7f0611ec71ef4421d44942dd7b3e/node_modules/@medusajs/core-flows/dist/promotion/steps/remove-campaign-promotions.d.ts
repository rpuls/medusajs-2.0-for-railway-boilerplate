import { LinkWorkflowInput } from "@medusajs/framework/types";
import { WorkflowData } from "@medusajs/framework/workflows-sdk";
export declare const removeCampaignPromotionsStepId = "remove-campaign-promotions";
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
export declare const removeCampaignPromotionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<WorkflowData<LinkWorkflowInput>, null>;
//# sourceMappingURL=remove-campaign-promotions.d.ts.map