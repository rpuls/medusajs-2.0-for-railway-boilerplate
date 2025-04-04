/**
 * The data to delete payment sessions.
 */
export interface DeletePaymentSessionStepInput {
    /**
     * The IDs of the payment sessions to delete.
     */
    ids: string[];
}
export declare const deletePaymentSessionsStepId = "delete-payment-sessions";
/**
 * This step deletes one or more payment sessions.
 *
 * Note: This step should not be used alone as it doesn't consider a revert
 * Use {@link deletePaymentSessionsWorkflow} instead, which uses this step.
 */
export declare const deletePaymentSessionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<DeletePaymentSessionStepInput, string[]>;
//# sourceMappingURL=delete-payment-sessions.d.ts.map