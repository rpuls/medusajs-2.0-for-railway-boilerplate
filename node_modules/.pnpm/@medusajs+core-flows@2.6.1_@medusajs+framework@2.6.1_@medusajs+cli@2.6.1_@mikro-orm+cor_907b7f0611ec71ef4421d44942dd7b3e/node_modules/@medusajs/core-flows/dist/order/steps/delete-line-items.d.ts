/**
 * The details of deleting order line items.
 */
export interface DeleteOrderLineItemsStepInput {
    /**
     * The IDs of the order line items to delete.
     */
    ids: string[];
}
/**
 * This step deletes order line items.
 */
export declare const deleteOrderLineItems: import("@medusajs/framework/workflows-sdk").StepFunction<DeleteOrderLineItemsStepInput, void | Record<string, string[]>>;
//# sourceMappingURL=delete-line-items.d.ts.map