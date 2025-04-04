/**
 * The data to delete price lists.
 */
export type DeletePriceListsWorkflowInput = {
    /**
     * The IDs of the price lists to delete.
     */
    ids: string[];
};
export declare const deletePriceListsWorkflowId = "delete-price-lists";
/**
 * This workflow deletes one or more price lists. It's used by the
 * [Delete Price List Admin API Route](https://docs.medusajs.com/api/admin#price-lists_deletepricelistsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete price lists in your custom flows.
 *
 * @example
 * const { result } = await deletePriceListsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["plist_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more price lists.
 */
export declare const deletePriceListsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeletePriceListsWorkflowInput, unknown, any[]>;
//# sourceMappingURL=delete-price-lists.d.ts.map