import { LinkWorkflowInput } from "@medusajs/framework/types";
/**
 * The sales channels to manage for a stock location.
 *
 * @property id - The ID of the stock location.
 * @property add - The IDs of the sales channels to add to the stock location.
 * @property remove - The IDs of the sales channels to remove from the stock location.
 */
export type LinkSalesChannelsToStockLocationWorkflowInput = LinkWorkflowInput;
export declare const linkSalesChannelsToStockLocationWorkflowId = "link-sales-channels-to-stock-location";
/**
 * This workflow manages the sales channels of a stock location. It's used by the
 * [Manage Sales Channels Admin API Route](https://docs.medusajs.com/api/admin#stock-locations_poststocklocationsidsaleschannels).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to manage the sales channels of a stock location in your custom flows.
 *
 * @example
 * const { result } = await linkSalesChannelsToStockLocationWorkflow(container)
 * .run({
 *   input: {
 *     id: "sloc_123",
 *     add: ["sc_123"],
 *     remove: ["sc_321"]
 *   }
 * })
 *
 * @summary
 *
 * Manage the sales channels of a stock location.
 */
export declare const linkSalesChannelsToStockLocationWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<LinkWorkflowInput, unknown, any[]>;
//# sourceMappingURL=link-sales-channels-to-stock-location.d.ts.map