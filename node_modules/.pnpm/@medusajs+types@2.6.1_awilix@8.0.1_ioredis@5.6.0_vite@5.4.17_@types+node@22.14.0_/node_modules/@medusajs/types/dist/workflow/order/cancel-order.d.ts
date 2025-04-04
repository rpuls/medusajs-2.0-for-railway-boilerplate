/**
 * The details of the order cancelation.
 */
export interface CancelOrderWorkflowInput {
    /**
     * The ID of the order to cancel.
     */
    order_id: string;
    /**
     * Whether to notify the customer of the cancelation.
     */
    no_notification?: boolean;
    /**
     * The ID of the user that canceled the order.
     */
    canceled_by?: string;
}
//# sourceMappingURL=cancel-order.d.ts.map