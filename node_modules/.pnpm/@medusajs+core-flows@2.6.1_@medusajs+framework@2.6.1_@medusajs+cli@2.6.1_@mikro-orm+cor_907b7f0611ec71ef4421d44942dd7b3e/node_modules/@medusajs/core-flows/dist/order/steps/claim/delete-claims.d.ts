/**
 * The details of deleting one or more claims.
 */
export type DeleteOrderClaimsInput = {
    /**
     * The IDs of the claims to delete.
     */
    ids: string[];
};
export declare const deleteClaimsStepId = "delete-claims";
/**
 * This step deletes one or more order claims.
 */
export declare const deleteClaimsStep: import("@medusajs/framework/workflows-sdk").StepFunction<DeleteOrderClaimsInput, void | Record<string, string[]>>;
//# sourceMappingURL=delete-claims.d.ts.map