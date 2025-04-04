/**
 * The details of deleting order changes.
 */
export interface DeleteOrderChangesStepInput {
    /**
     * The IDs of the order changes to delete.
     */
    ids: string[];
}
export declare const deleteOrderChangesStepId = "delete-order-change";
/**
 * This step deletes order changes.
 */
export declare const deleteOrderChangesStep: import("@medusajs/framework/workflows-sdk").StepFunction<DeleteOrderChangesStepInput, void | Record<string, string[]>>;
//# sourceMappingURL=delete-order-changes.d.ts.map