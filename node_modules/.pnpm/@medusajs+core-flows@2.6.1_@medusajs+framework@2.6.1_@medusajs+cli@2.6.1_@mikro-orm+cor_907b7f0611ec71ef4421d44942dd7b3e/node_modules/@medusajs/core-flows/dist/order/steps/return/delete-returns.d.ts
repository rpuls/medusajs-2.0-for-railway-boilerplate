/**
 * The details of deleting the returns.
 */
export type DeleteReturnStepInput = {
    /**
     * The IDs of the returns to delete.
     */
    ids: string[];
};
export declare const deleteReturnsStepId = "delete-return";
/**
 * This step deletes one or more returns.
 */
export declare const deleteReturnsStep: import("@medusajs/framework/workflows-sdk").StepFunction<DeleteReturnStepInput, void | never[] | Record<string, string[]>>;
//# sourceMappingURL=delete-returns.d.ts.map