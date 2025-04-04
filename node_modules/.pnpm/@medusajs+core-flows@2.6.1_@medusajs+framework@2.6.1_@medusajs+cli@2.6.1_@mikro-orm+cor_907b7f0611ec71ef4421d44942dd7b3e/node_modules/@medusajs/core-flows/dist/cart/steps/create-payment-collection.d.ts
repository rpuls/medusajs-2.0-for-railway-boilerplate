import { BigNumberInput } from "@medusajs/framework/types";
/**
 * The details of the payment collections to create.
 */
export type CreatePaymentCollectionCartStepInput = {
    currency_code: string;
    /**
     * The payment collection's amount.
     */
    amount: BigNumberInput;
    /**
     * Custom key-value pairs to store in the payment collection.
     */
    metadata?: Record<string, unknown>;
}[];
export declare const createPaymentCollectionsStepId = "create-payment-collections";
/**
 * This step creates payment collections in a cart.
 *
 * @example
 * const data = createPaymentCollectionsStep([{
 *   "currency_code": "usd",
 *   "amount": 40
 * }])
 */
export declare const createPaymentCollectionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreatePaymentCollectionCartStepInput, import("@medusajs/framework/types").PaymentCollectionDTO[]>;
//# sourceMappingURL=create-payment-collection.d.ts.map