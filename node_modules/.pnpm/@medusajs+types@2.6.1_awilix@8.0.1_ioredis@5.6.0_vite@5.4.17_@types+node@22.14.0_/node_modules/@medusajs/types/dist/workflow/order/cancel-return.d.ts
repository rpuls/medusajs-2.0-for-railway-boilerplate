/**
 * The details to cancel a return.
 */
export interface CancelReturnWorkflowInput {
    /**
     * The ID of the return to cancel.
     */
    return_id: string;
    /**
     * Whether to notify the customer of the return cancellation.
     */
    no_notification?: boolean;
    /**
     * The ID of the user that's canceling the return.
     */
    canceled_by?: string;
}
//# sourceMappingURL=cancel-return.d.ts.map