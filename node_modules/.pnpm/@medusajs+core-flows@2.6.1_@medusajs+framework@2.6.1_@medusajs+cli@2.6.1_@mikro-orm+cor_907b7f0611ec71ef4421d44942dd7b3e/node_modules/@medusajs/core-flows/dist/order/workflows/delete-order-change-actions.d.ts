/**
 * The details of the order change actions to delete.
 */
export type DeleteOrderChangeActionsWorkflowInput = {
    /**
     * The IDs of the order change actions to delete.
     */
    ids: string[];
};
export declare const deleteOrderChangeActionsWorkflowId = "delete-order-change-actions";
/**
 * This workflow deletes one or more order change actions.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * deleting an order change action.
 *
 * @summary
 *
 * Delete one or more order change actions.
 */
export declare const deleteOrderChangeActionsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteOrderChangeActionsWorkflowInput, unknown, any[]>;
//# sourceMappingURL=delete-order-change-actions.d.ts.map