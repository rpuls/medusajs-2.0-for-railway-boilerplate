/**
 * The details of the order claim to be canceled.
 */
export interface CancelOrderClaimWorkflowInput {
    /**
     * The ID of the claim to cancel.
     */
    claim_id: string;
    /**
     * Whether to notify the customer of the cancellation.
     */
    no_notification?: boolean;
    /**
     * The ID of the user canceling the claim.
     */
    canceled_by?: string;
}
//# sourceMappingURL=cancel-claim.d.ts.map