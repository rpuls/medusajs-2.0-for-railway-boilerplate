/**
 * The details of deleting order change actions.
 */
export interface DeleteOrderChangeActionsStepInput {
    /**
     * The IDs of the order change actions to delete.
     */
    ids: string[];
}
export declare const deleteOrderChangeActionsStepId = "delete-order-change-actions";
/**
 * This step deletes order change actions.
 */
export declare const deleteOrderChangeActionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<DeleteOrderChangeActionsStepInput, undefined>;
//# sourceMappingURL=delete-order-change-actions.d.ts.map