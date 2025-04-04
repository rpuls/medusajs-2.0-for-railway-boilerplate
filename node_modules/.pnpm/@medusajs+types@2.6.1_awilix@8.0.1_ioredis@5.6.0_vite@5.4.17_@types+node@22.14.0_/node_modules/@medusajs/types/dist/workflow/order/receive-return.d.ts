import { BigNumberInput } from "../../totals";
/**
 * The details of an item to be received in a return.
 */
interface ReceiveReturnItem {
    /**
     * The ID of the order item to receive.
     */
    id: string;
    /**
     * The quantity of the item to receive.
     */
    quantity: BigNumberInput;
    /**
     * An internal note viewed only by admin users.
     */
    internal_note?: string;
    /**
     * Custom key-value pairs of data to store in the return item.
     */
    metadata?: Record<string, any> | null;
}
/**
 * The details of a return requested to be received.
 */
export interface BeginReceiveOrderReturnWorkflowInput {
    /**
     * The ID of the return to receive.
     */
    return_id: string;
    /**
     * The ID of the user that's requesting the return receival.
     */
    created_by?: string;
    /**
     * Description of the return receival.
     */
    description?: string;
    /**
     * A note viewed by admins only related to the return receival.
     */
    internal_note?: string;
    /**
     * Custom key-value pairs of data to store in the return receival.
     */
    metadata?: Record<string, any> | null;
}
/**
 * The data to mark items as received in a return.
 */
export interface ReceiveOrderReturnItemsWorkflowInput {
    /**
     * The ID of the return to mark its items as received.
     */
    return_id: string;
    /**
     * The items to mark as received.
     */
    items: ReceiveReturnItem[];
}
/**
 * The data to mark a return as received and completed.
 */
export interface ReceiveCompleteOrderReturnWorkflowInput {
    /**
     * The ID of the return to receive and complete.
     */
    return_id: string;
    /**
     * The ID of the user that's receiving and completing the return.
     */
    created_by?: string;
    /**
     * The received items.
     */
    items: ReceiveReturnItem[];
    /**
     * Description of the return receival.
     */
    description?: string;
    /**
     * A note viewed by admins only related to the return receival.
     */
    internal_note?: string;
    /**
     * Custom key-value pairs of data to store in the return receival.
     */
    metadata?: Record<string, any> | null;
}
/**
 * The details of updating an item in a return receival request.
 */
export interface UpdateReceiveItemReturnRequestWorkflowInput {
    /**
     * The ID of the return to update the item in.
     */
    return_id: string;
    /**
     * The ID of the action associated with the item to update.
     * Every return item has an `actions` property, whose value is an array of actions.
     * You can find the action with the name `RECEIVE_RETURN_ITEM` using its `action` property, and use the value of
     * its `id` property.
     */
    action_id: string;
    /**
     * The data to update in the item.
     */
    data: {
        /**
         * The new quantity of the item.
         */
        quantity?: BigNumberInput;
        /**
         * An internal note viewed only by admin users.
         */
        internal_note?: string | null;
    };
}
export {};
//# sourceMappingURL=receive-return.d.ts.map