/**
 * The data to validate that the specified payment session IDs were deleted.
 */
export interface ValidateDeletedPaymentSessionsStepInput {
    /**
     * The payment session IDs that were supposed to be deleted.
     */
    idsToDelete: string[];
    /**
     * The payment session IDs that were actually deleted.
     */
    idsDeleted: string[];
}
export declare const validateDeletedPaymentSessionsStepId = "validate-deleted-payment-sessions";
/**
 * This step validates that the specified payment session IDs were deleted.
 * If not all payment sessions were deleted, the step throws an error.
 *
 * @example
 * const data = validateDeletedPaymentSessionsStep({
 *   idsDeleted: ["pay_123"],
 *   idsToDelete: ["pay_123"]
 * })
 */
export declare const validateDeletedPaymentSessionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateDeletedPaymentSessionsStepInput, undefined>;
//# sourceMappingURL=validate-deleted-payment-sessions.d.ts.map