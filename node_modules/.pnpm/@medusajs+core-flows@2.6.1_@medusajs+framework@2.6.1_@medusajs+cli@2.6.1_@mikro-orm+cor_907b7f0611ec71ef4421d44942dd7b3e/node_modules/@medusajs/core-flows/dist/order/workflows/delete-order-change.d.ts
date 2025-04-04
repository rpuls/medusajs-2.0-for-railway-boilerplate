/**
 * The details of the order changes to delete.
 */
export type DeleteOrderChangeWorkflowInput = {
    /**
     * The IDs of the order changes to delete.
     */
    ids: string[];
};
export declare const deleteOrderChangeWorkflowId = "delete-order-change";
/**
 * This workflow deletes one or more order changes.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * deleting an order change.
 *
 * @summary
 *
 * Delete one or more order changes.
 */
export declare const deleteOrderChangeWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteOrderChangeWorkflowInput, unknown, any[]>;
//# sourceMappingURL=delete-order-change.d.ts.map