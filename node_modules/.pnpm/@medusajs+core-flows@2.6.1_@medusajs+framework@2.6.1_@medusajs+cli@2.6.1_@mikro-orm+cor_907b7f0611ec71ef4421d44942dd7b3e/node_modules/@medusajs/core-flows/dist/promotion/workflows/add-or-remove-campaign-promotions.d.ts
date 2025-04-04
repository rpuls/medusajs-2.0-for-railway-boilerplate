import { LinkWorkflowInput } from "@medusajs/framework/types";
/**
 * The data to manage the promotions of a campaign.
 *
 * @property id - The ID of the campaign to manage the promotions of.
 * @property add - The IDs of the promotions to add to the campaign.
 * @property remove - The IDs of the promotions to remove from the campaign.
 */
export type AddOrRemoveCampaignPromotionsWorkflowInput = LinkWorkflowInput;
export declare const addOrRemoveCampaignPromotionsWorkflowId = "add-or-remove-campaign-promotions";
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
export declare const addOrRemoveCampaignPromotionsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<LinkWorkflowInput, unknown, any[]>;
//# sourceMappingURL=add-or-remove-campaign-promotions.d.ts.map