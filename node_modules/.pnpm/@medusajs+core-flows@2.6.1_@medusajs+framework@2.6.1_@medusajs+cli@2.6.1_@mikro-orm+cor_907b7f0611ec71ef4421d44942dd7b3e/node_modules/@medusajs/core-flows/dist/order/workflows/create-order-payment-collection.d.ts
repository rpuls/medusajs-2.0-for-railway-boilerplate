/**
 * The details of the payment collection to create.
 */
export type CreateOrderPaymentCollectionWorkflowInput = {
    /**
     * The id of the order for which to create a payment collection.
     */
    order_id: string;
    /**
     * The amount of the payment collection.
     */
    amount: number;
};
export declare const createOrderPaymentCollectionWorkflowId = "create-order-payment-collection";
/**
 * This workflow creates a payment collection for an order. It's used by the
 * [Create Payment Collection Admin API Route](https://docs.medusajs.com/api/admin#payment-collections_postpaymentcollections).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * creating a payment collection for an order.
 *
 * @example
 * const { result } = await createOrderPaymentCollectionWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     amount: 10,
 *   }
 * })
 *
 * @summary
 *
 * Create a payment collection for an order.
 */
export declare const createOrderPaymentCollectionWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateOrderPaymentCollectionWorkflowInput, import("@medusajs/types").PaymentCollectionDTO[], []>;
//# sourceMappingURL=create-order-payment-collection.d.ts.map