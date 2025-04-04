import { LinkWorkflowInput } from "@medusajs/framework/types";
/**
 * The data to manage the sales channels of a publishable API key.
 *
 * @property id - The ID of the publishable API key.
 * @property add - The sales channel IDs to add to the publishable API key.
 * @property remove - The sales channel IDs to remove from the publishable API key.
 */
export type LinkSalesChannelsToApiKeyWorkflowInput = LinkWorkflowInput;
export declare const linkSalesChannelsToApiKeyWorkflowId = "link-sales-channels-to-api-key";
/**
 * This workflow manages the sales channels of a publishable API key. It's used by the
 * [Manage Sales Channels API Route](https://docs.medusajs.com/api/admin#api-keys_postapikeysidsaleschannels).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * manage the sales channels of a publishable API key within your custom flows.
 *
 * @example
 * const { result } = await linkSalesChannelsToApiKeyWorkflow(container)
 * .run({
 *   input: {
 *     id: "apk_132",
 *     add: ["sc_123"],
 *     remove: ["sc_321"]
 *   }
 * })
 *
 * @summary
 * Manage the sales channels of a publishable API key.
 */
export declare const linkSalesChannelsToApiKeyWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<LinkWorkflowInput, unknown, any[]>;
//# sourceMappingURL=link-sales-channels-to-publishable-key.d.ts.map