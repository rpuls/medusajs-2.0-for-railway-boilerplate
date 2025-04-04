import { FilterablePaymentCollectionProps, PaymentCollectionUpdatableFields } from "@medusajs/framework/types";
/**
 * The data to update a payment collection.
 */
export interface UpdatePaymentCollectionStepInput {
    /**
     * The filters to select the payment collections to update.
     */
    selector: FilterablePaymentCollectionProps;
    /**
     * The data to update in the selected payment collections.
     */
    update: PaymentCollectionUpdatableFields;
}
export declare const updatePaymentCollectionStepId = "update-payment-collection";
/**
 * This step updates payment collections matching the specified filters.
 *
 * @example
 * const data = updatePaymentCollectionStep({
 *   selector: {
 *     id: "paycol_123",
 *   },
 *   update: {
 *     amount: 10,
 *   }
 * })
 */
export declare const updatePaymentCollectionStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdatePaymentCollectionStepInput, import("@medusajs/framework/types").PaymentCollectionDTO[]>;
//# sourceMappingURL=update-payment-collection.d.ts.map