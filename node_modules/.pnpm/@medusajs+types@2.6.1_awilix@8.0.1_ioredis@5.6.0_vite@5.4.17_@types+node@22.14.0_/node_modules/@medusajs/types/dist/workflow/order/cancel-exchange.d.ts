/**
 * The details to cancel an order exchange.
 */
export interface CancelOrderExchangeWorkflowInput {
    /**
     * The ID of the exchange to cancel.
     */
    exchange_id: string;
    /**
     * Whether to notify the customer of the cancellation.
     */
    no_notification?: boolean;
    /**
     * The ID of the user that's canceling the exchange.
     */
    canceled_by?: string;
}
//# sourceMappingURL=cancel-exchange.d.ts.map