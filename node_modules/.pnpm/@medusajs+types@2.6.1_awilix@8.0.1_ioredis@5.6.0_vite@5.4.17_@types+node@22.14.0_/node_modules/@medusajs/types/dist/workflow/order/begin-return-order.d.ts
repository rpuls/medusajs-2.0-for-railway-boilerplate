/**
 * The details of a return to create.
 */
export interface BeginOrderReturnWorkflowInput {
    /**
     * The ID of the order to create the return for.
     */
    order_id: string;
    /**
     * The ID of the location to return the items to.
     */
    location_id?: string;
    /**
     * The ID of the user creating the return.
     */
    created_by?: string | null;
    /**
     * A note viewed by admins only related to the return.
     */
    internal_note?: string;
    /**
     * Description of the return.
     */
    description?: string;
    /**
     * Custom key-value pairs of data to store in the return.
     */
    metadata?: Record<string, unknown> | null;
}
//# sourceMappingURL=begin-return-order.d.ts.map