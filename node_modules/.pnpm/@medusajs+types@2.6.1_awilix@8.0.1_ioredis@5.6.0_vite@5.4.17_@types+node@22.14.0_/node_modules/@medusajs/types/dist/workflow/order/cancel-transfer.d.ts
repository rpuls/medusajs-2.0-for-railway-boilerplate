/**
 * The details of the order transfer cancelation.
 */
export type CancelTransferOrderRequestWorkflowInput = {
    /**
     * The ID of the order to cancel the transfer for.
     */
    order_id: string;
    /**
     * The ID of the authenticated user requesting to cancel the transfer.
     */
    logged_in_user_id: string;
    /**
     * The actor type requesting to cancel the transfer.
     */
    actor_type: "customer" | "user";
};
//# sourceMappingURL=cancel-transfer.d.ts.map