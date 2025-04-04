/**
 * The IDs of return reasons to delete.
 */
export type DeleteReturnReasonsWorkflowInput = {
    /**
     * The IDs of return reasons to delete.
     */
    ids: string[];
};
export declare const deleteReturnReasonsWorkflowId = "delete-return-reasons";
/**
 * This workflow deletes one or more return reasons. It's used by the
 * [Delete Return Reasons Admin API Route](https://docs.medusajs.com/api/admin#return-reasons_deletereturnreasonsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete return reasons within your custom flows.
 *
 * @example
 * const { result } = await deleteReturnReasonsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["rr_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete return reasons.
 */
export declare const deleteReturnReasonsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteReturnReasonsWorkflowInput, unknown, any[]>;
//# sourceMappingURL=delete-return-reasons.d.ts.map