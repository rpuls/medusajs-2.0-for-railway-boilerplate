/**
 * The details of deleting one or more exchanges.
 */
export type DeleteOrderExchangesInput = {
    /**
     * The IDs of the exchanges to delete.
     */
    ids: string[];
};
export declare const deleteExchangesStepId = "delete-exchanges";
/**
 * This step deletes one or more exchanges.
 */
export declare const deleteExchangesStep: import("@medusajs/framework/workflows-sdk").StepFunction<DeleteOrderExchangesInput, void | Record<string, string[]>>;
//# sourceMappingURL=delete-exchanges.d.ts.map