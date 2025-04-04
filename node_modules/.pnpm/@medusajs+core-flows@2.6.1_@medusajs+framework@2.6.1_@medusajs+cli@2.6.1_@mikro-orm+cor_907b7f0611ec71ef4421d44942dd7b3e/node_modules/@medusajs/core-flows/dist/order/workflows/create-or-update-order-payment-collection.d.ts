import { PaymentCollectionDTO } from "@medusajs/framework/types";
/**
 * The details of the order payment collection to create or update.
 */
export type CreateOrUpdateOrderPaymentCollectionInput = {
    /**
     * The order to create or update payment collection for.
     */
    order_id: string;
    /**
     * The amount to charge. It can't be greater than the
     * pending amount of the order. The order's payment collection
     * will be created or updated with this amount.
     * If no amount is set, the payment collection's amount is set to `0`.
     */
    amount?: number;
};
export declare const createOrUpdateOrderPaymentCollectionWorkflowId = "create-or-update-order-payment-collection";
/**
 * This workflow creates or updates payment collection for an order. It's used by other order-related workflows,
 * such as {@link createOrderPaymentCollectionWorkflow} to update an order's payment collections based on changes made to the order.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * creating or updating payment collections for an order.
 *
 * @example
 * const { result } = await createOrUpdateOrderPaymentCollectionWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     amount: 20
 *   }
 * })
 *
 * @summary
 *
 * Create or update payment collection for an order.
 */
export declare const createOrUpdateOrderPaymentCollectionWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<{
    order_id: string;
    amount?: number;
}, PaymentCollectionDTO[], []>;
//# sourceMappingURL=create-or-update-order-payment-collection.d.ts.map