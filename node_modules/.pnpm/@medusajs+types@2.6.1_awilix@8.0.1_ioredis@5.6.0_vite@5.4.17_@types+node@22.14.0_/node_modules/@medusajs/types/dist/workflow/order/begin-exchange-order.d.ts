/**
 * The details to request an order exchange.
 */
export interface BeginOrderExchangeWorkflowInput {
    /**
     * The ID of the order to request an exchange for.
     */
    order_id: string;
    /**
     * The id of the user that creates the order exchange
     */
    created_by?: string | null;
    /**
     * An internal note viewed only by admin users.
     */
    internal_note?: string;
    /**
     * A description of the exchange.
     */
    description?: string;
    /**
     * Custom key-value pairs of data to store in the exchange.
     */
    metadata?: Record<string, unknown> | null;
}
//# sourceMappingURL=begin-exchange-order.d.ts.map