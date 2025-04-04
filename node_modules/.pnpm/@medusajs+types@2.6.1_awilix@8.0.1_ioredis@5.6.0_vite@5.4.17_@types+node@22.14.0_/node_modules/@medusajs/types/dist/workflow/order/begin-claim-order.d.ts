import { OrderClaimType } from "../../order/mutations";
/**
 * The details of the order claim to be requested.
 */
export interface BeginOrderClaimWorkflowInput {
    /**
     * The type of the order claim.
     */
    type: OrderClaimType;
    /**
     * The ID of the order to create the claim for.
     */
    order_id: string;
    /**
     * The ID of the user creating the order claim.
     */
    created_by?: string | null;
    /**
     * An internal note viewed by admin users only.
     */
    internal_note?: string;
    /**
     * A description of the order claim.
     */
    description?: string;
    /**
     * Custom key-value pairs of data to store in the order claim.
     */
    metadata?: Record<string, unknown> | null;
}
//# sourceMappingURL=begin-claim-order.d.ts.map