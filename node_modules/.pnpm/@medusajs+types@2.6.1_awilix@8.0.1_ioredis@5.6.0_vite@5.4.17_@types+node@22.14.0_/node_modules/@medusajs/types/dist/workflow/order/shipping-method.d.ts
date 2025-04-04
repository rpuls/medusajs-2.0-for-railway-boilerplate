import { BigNumberInput } from "../../totals";
/**
 * The details to update a shipping method of a return.
 */
export interface UpdateReturnShippingMethodWorkflowInput {
    /**
     * The ID of the return to update its shipping method.
     */
    return_id: string;
    /**
     * The ID of the action associated with the shipping method to update.
     * Every shipping method has an `actions` property, whose value is an array of actions.
     * You can find the action with the name `SHIPPING_ADD` using its `action` property, and use the value of
     * its `id` property.
     */
    action_id: string;
    /**
     * The data to update in the shipping method.
     */
    data: {
        /**
         * Set a custom amount for the shipping method.
         */
        custom_amount?: BigNumberInput | null;
        /**
         * A note viewed by admins only related to the shipping method.
         */
        internal_note?: string | null;
        /**
         * Custom key-value pairs of data to store in the shipping method.
         */
        metadata?: Record<string, any> | null;
    };
}
/**
 * The details to delete a shipping method from a return.
 */
export interface DeleteReturnShippingMethodWorkflowInput {
    /**
     * The ID of the return to delete the shipping method from.
     */
    return_id: string;
    /**
     * The ID of the action associated with the shipping method to remove.
     * Every shipping method has an `actions` property, whose value is an array of actions.
     * You can find the action with the name `SHIPPING_ADD` using its `action` property, and use the value of
     * its `id` property.
     */
    action_id: string;
}
/**
 * The details of the shipping method to be updated on the claim.
 */
export interface UpdateClaimShippingMethodWorkflowInput {
    /**
     * The ID of the claim to update the shipping method on.
     */
    claim_id: string;
    /**
     * The ID of the action associated with the shipping method to update.
     * Every shipping method has an `actions` property, whose value is an array of actions.
     * You can find the action with the name `SHIPPING_ADD` using its `action` property, and use the value of
     * its `id` property.
     */
    action_id: string;
    /**
     * The data to update in the shipping method.
     */
    data: {
        /**
         * Set a custom amount for the shipping method.
         */
        custom_amount?: BigNumberInput | null;
        /**
         * A note viewed by admins only related to the shipping method.
         */
        internal_note?: string | null;
        /**
         * Custom key-value pairs of data to store in the shipping method.
         */
        metadata?: Record<string, any> | null;
    };
}
/**
 * The details of the shipping method to be deleted from the claim.
 */
export interface DeleteClaimShippingMethodWorkflowInput {
    /**
     * The ID of the claim to delete the shipping method from.
     */
    claim_id: string;
    /**
     * The ID of the action associated with the shipping method to remove.
     * Every shipping method has an `actions` property, whose value is an array of actions.
     * You can find the action with the name `SHIPPING_ADD` using its `action` property, and use the value of
     * its `id` property.
     */
    action_id: string;
}
/**
 * The details of the shipping method to be updated in the exchange.
 */
export interface UpdateExchangeShippingMethodWorkflowInput {
    /**
     * The ID of the exchange to update the shipping method in.
     */
    exchange_id: string;
    /**
     * The ID of the action associated with the shipping method to update.
     * Every shipping method has an `actions` property, whose value is an array of actions.
     * You can find the action with the name `SHIPPING_ADD` using its `action` property, and use the value of
     * its `id` property.
     */
    action_id: string;
    /**
     * The data to update in the shipping method.
     */
    data: {
        /**
         * Set a custom amount for the shipping method.
         */
        custom_amount?: BigNumberInput | null;
        /**
         * A note viewed by admins only related to the shipping method.
         */
        internal_note?: string | null;
        /**
         * Custom key-value pairs of data to store in the shipping method.
         */
        metadata?: Record<string, any> | null;
    };
}
/**
 * The details of the shipping method to be updated in the order edit.
 */
export interface UpdateOrderEditShippingMethodWorkflowInput {
    /**
     * The ID of the order to update the shipping method in its edit.
     */
    order_id: string;
    /**
     * The ID of the action associated with the shipping method to update.
     * Every shipping method has an `actions` property, whose value is an array of actions.
     * You can find the action with the name `SHIPPING_ADD` using its `action` property, and use the value of
     * its `id` property.
     */
    action_id: string;
    /**
     * The details to update in the shipping method.
     */
    data: {
        /**
         * Set a custom amount for the shipping method.
         */
        custom_amount?: BigNumberInput | null;
        /**
         * A note viewed by admins only related to the shipping method.
         */
        internal_note?: string | null;
        /**
         * Custom key-value pairs of data to store in the shipping method.
         */
        metadata?: Record<string, any> | null;
    };
}
/**
 * The details of the shipping method to be deleted from the exchange.
 */
export interface DeleteExchangeShippingMethodWorkflowInput {
    /**
     * The ID of the exchange to delete the shipping method from.
     */
    exchange_id: string;
    /**
     * The ID of the action associated with the shipping method to remove.
     * Every shipping method has an `actions` property, whose value is an array of actions.
     * You can find the action with the name `SHIPPING_ADD` using its `action` property, and use the value of
     * its `id` property.
     */
    action_id: string;
}
/**
 * The details to delete a shipping method from an order edit.
 */
export interface DeleteOrderEditShippingMethodWorkflowInput {
    /**
     * The ID of the order to delete the shipping method from.
     */
    order_id: string;
    /**
     * The ID of the action associated with the shipping method to remove.
     * Every shipping method has an `actions` property, whose value is an array of actions.
     * You can find the action with the name `SHIPPING_ADD` using its `action` property, and use the value of
     * its `id` property.
     */
    action_id: string;
}
//# sourceMappingURL=shipping-method.d.ts.map