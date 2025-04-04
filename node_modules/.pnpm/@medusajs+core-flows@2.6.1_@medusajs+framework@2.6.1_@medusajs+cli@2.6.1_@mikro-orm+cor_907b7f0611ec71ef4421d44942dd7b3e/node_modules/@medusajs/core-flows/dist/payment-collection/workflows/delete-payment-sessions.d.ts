/**
 * The data to delete payment sessions.
 */
export interface DeletePaymentSessionsWorkflowInput {
    /**
     * The IDs of the payment sessions to delete.
     */
    ids: string[];
}
export declare const deletePaymentSessionsWorkflowId = "delete-payment-sessions";
/**
 * This workflow deletes one or more payment sessions. It's used by other workflows, like
 * {@link refreshPaymentCollectionForCartWorkflow} to delete payment sessions when the cart's total changes.
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete payment sessions in your custom flows.
 *
 * @example
 * const { result } = await deletePaymentSessionsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["payses_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete payment sessions.
 */
export declare const deletePaymentSessionsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeletePaymentSessionsWorkflowInput, string[], []>;
//# sourceMappingURL=delete-payment-sessions.d.ts.map