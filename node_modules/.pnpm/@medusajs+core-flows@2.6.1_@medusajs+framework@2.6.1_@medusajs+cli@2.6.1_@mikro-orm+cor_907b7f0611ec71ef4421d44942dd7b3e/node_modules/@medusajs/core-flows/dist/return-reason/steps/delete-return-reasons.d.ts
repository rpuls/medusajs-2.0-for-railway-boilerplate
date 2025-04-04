/**
 * The IDs of the return reasons to delete.
 */
export type DeleteReturnReasonStepInput = string[];
export declare const deleteReturnReasonStepId = "delete-return-reasons";
/**
 * This step deletes one or more return reasons.
 *
 * @example
 * const data = deleteReturnReasonStep(["rr_123"])
 */
export declare const deleteReturnReasonStep: import("@medusajs/framework/workflows-sdk").StepFunction<DeleteReturnReasonStepInput, undefined>;
//# sourceMappingURL=delete-return-reasons.d.ts.map