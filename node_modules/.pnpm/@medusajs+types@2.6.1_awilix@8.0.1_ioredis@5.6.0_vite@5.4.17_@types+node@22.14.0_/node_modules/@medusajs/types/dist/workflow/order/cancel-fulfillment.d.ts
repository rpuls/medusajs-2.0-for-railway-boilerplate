export interface CancelOrderFulfillmentWorkflowInput {
    /**
     * The ID of the order to cancel its fulfillment.
     */
    order_id: string;
    /**
     * The ID of the fulfillment to cancel.
     */
    fulfillment_id: string;
    /**
     * Whether to notify the customer about the cancellation.
     */
    no_notification?: boolean;
    /**
     * The ID of the user that canceled the fulfillment.
     */
    canceled_by?: string;
}
//# sourceMappingURL=cancel-fulfillment.d.ts.map