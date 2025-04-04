import { PaymentCollectionDTO } from "@medusajs/framework/types";
/**
 * This step validates that the order doesn't have an active payment collection.
 */
export declare const throwUnlessStatusIsNotPaid: import("@medusajs/framework/workflows-sdk").StepFunction<{
    paymentCollection: PaymentCollectionDTO;
}, unknown>;
/**
 * The details of the payment collection to delete.
 */
export type DeleteOrderPaymentCollectionsInput = {
    /**
     * The ID of the payment collection to delete.
     */
    id: string;
};
export declare const deleteOrderPaymentCollectionsId = "delete-order-payment-collectionworkflow";
/**
 * This workflow deletes one or more payment collections of an order. It's used by the
 * [Delete Payment Collection API Route](https://docs.medusajs.com/api/admin#payment-collections_deletepaymentcollectionsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * deleting a payment collection of an order.
 *
 * @example
 * const { result } = await deleteOrderPaymentCollections(container)
 * .run({
 *   input: {
 *     id: "order_123"
 *   }
 * })
 *
 * @summary
 *
 * Delete a payment collection of an order.
 */
export declare const deleteOrderPaymentCollections: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteOrderPaymentCollectionsInput, unknown, any[]>;
//# sourceMappingURL=delete-order-payment-collection.d.ts.map