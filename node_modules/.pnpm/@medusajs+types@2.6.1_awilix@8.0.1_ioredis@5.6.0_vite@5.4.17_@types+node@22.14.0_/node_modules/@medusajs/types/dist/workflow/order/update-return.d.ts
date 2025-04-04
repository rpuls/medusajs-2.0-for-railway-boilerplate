/**
 * The data to update a return's details.
 */
export interface UpdateReturnWorkflowInput {
    /**
     * The ID of the return to update.
     */
    return_id: string;
    /**
     * The ID of the stock location that items are returned to.
     */
    location_id?: string | null;
    /**
     * Whether to notify the customer about the return update.
     */
    no_notification?: boolean;
    /**
     * Custom key-value pairs of data to store in the return.
     */
    metadata?: Record<string, any> | null;
}
//# sourceMappingURL=update-return.d.ts.map