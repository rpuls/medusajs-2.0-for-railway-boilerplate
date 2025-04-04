/**
 * The data to delete sales channels.
 */
export type DeleteSalesChannelsWorkflowInput = {
    /**
     * The IDs of the sales channels to delete.
     */
    ids: string[];
};
export declare const deleteSalesChannelsWorkflowId = "delete-sales-channels";
/**
 * This workflow deletes one or more sales channels. It's used by the
 * [Delete Sales Channel Admin API Route](https://docs.medusajs.com/api/admin#sales-channels_deletesaleschannelsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete sales channels within your custom flows.
 *
 * @example
 * const { result } = await deleteSalesChannelsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["sc_123"],
 *   }
 * })
 *
 * @summary
 *
 * Delete sales channels.
 */
export declare const deleteSalesChannelsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteSalesChannelsWorkflowInput, unknown, any[]>;
//# sourceMappingURL=delete-sales-channels.d.ts.map