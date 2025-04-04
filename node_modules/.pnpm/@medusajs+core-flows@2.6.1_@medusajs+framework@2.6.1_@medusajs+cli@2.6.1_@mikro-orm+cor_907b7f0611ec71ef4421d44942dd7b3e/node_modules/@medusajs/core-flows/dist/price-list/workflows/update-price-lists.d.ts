import { UpdatePriceListWorkflowInputDTO } from "@medusajs/framework/types";
/**
 * The data to update price lists.
 */
export type UpdatePriceListsWorkflowInput = {
    /**
     * The price lists to update.
     */
    price_lists_data: UpdatePriceListWorkflowInputDTO[];
};
export declare const updatePriceListsWorkflowId = "update-price-lists";
/**
 * This workflow updates one or more price lists. It's used by the
 * [Update Price List Admin API Route](https://docs.medusajs.com/api/admin#price-lists_postpricelistsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update price lists in your custom flows.
 *
 * @example
 * const { result } = await updatePriceListsWorkflow(container)
 * .run({
 *   input: {
 *     price_lists_data: [
 *       {
 *         id: "plist_123",
 *         title: "Test Price List",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Update one or more price lists.
 */
export declare const updatePriceListsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<{
    price_lists_data: UpdatePriceListWorkflowInputDTO[];
}, unknown, any[]>;
//# sourceMappingURL=update-price-lists.d.ts.map