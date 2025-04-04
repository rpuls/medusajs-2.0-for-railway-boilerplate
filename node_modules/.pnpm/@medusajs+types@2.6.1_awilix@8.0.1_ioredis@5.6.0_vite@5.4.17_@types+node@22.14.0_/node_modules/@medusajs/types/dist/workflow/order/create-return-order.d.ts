import { BigNumberInput } from "../../totals";
import { CreateFulfillmentLabelWorkflowDTO } from "../fulfillment/create-fulfillment";
/**
 * The details of an item to be returned.
 */
export interface CreateReturnItem {
    /**
     * The ID of the order item to return.
     */
    id: string;
    /**
     * The quantity of the item to return.
     */
    quantity: BigNumberInput;
    /**
     * An internal note viewed only by admin users.
     */
    internal_note?: string | null;
    /**
     * The ID of the reason indicating why the item is being returned.
     */
    reason_id?: string | null;
    /**
     * More details about the returned item.
     */
    note?: string | null;
    /**
     * Custom key-value pairs of data to store in the return item.
     */
    metadata?: Record<string, any> | null;
}
/**
 * The details to create a return order.
 */
export interface CreateOrderReturnWorkflowInput {
    /**
     * The ID of the order to return items from.
     */
    order_id: string;
    /**
     * The ID of the customer that's creating the return
     */
    created_by?: string | null;
    /**
     * The items to return.
     */
    items: CreateReturnItem[];
    /**
     * The shipping details of the returned items.
     */
    return_shipping?: {
        /**
         * The ID of the shipping option to use for the return.
         */
        option_id: string;
        /**
         * The custom amount to create the return shipping with.
         * If not provided, the shipping option's amount is used.
         */
        price?: number;
        /**
         * The shipmen's label details.
         */
        labels?: CreateFulfillmentLabelWorkflowDTO[];
    };
    /**
     * More details about the return.
     */
    note?: string | null;
    /**
     * Whether to mark the return as received immediately.
     */
    receive_now?: boolean;
    /**
     * The amount to refund the customer.
     */
    refund_amount?: number;
    /**
     * The ID of the location to return the items to.
     * If not provided, the return shipping option's location
     * is used.
     */
    location_id?: string | null;
}
//# sourceMappingURL=create-return-order.d.ts.map