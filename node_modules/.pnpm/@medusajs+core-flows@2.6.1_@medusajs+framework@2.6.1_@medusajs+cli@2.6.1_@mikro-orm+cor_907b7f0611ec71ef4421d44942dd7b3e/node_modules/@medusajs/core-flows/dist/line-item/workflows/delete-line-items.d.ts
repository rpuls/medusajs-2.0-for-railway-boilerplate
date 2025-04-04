/**
 * The data to delete line items from a cart.
 */
export type DeleteLineItemsWorkflowInput = {
    /**
     * The cart's ID.
     */
    cart_id: string;
    /**
     * The IDs of the line items to delete.
     */
    ids: string[];
};
export declare const deleteLineItemsWorkflowId = "delete-line-items";
/**
 * This workflow deletes line items from a cart. It's used by the
 * [Delete Line Item Store API Route](https://docs.medusajs.com/api/store#carts_deletecartsidlineitemsline_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete line items from a cart within your custom flows.
 *
 * @example
 * const { result } = await deleteLineItemsWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     ids: ["li_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete line items from a cart.
 */
export declare const deleteLineItemsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteLineItemsWorkflowInput, unknown, any[]>;
//# sourceMappingURL=delete-line-items.d.ts.map