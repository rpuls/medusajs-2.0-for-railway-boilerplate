import { LinkWorkflowInput } from "@medusajs/framework/types";
/**
 * The data to manage the sales channels of a publishable API key.
 *
 * @property id - The ID of the publishable API key.
 * @property add - The sales channel IDs to add to the publishable API key.
 * @property remove - The sales channel IDs to remove from the publishable API key.
 */
export type LinkSalesChannelsToApiKeyStepInput = LinkWorkflowInput;
export declare const linkSalesChannelsToApiKeyStepId = "link-sales-channels-to-api-key";
/**
 * This step manages the sales channels of a publishable API key.
 *
 * @example
 * const data = linkSalesChannelsToApiKeyStep({
 *   id: "apk_123",
 *   add: ["sc_123"],
 *   remove: ["sc_456"]
 * })
 */
export declare const linkSalesChannelsToApiKeyStep: import("@medusajs/framework/workflows-sdk").StepFunction<LinkWorkflowInput, undefined>;
//# sourceMappingURL=link-sales-channels-to-publishable-key.d.ts.map