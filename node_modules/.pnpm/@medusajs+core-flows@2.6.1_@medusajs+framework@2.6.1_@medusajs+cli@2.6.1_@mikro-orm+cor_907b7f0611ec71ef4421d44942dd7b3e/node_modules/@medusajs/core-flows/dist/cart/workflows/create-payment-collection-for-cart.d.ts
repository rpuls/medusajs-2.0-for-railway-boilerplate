import { CartDTO, CreatePaymentCollectionForCartWorkflowInputDTO } from "@medusajs/framework/types";
/**
 * The details of the cart to validate its payment collection.
 */
export type ValidateExistingPaymentCollectionStepInput = {
    /**
     * The cart to validate.
     */
    cart: CartDTO & {
        payment_collection?: any;
    };
};
/**
 * This step validates that a cart doesn't have a payment collection.
 * If the cart has a payment collection, the step throws an error.
 *
 * :::tip
 *
 * You can use the {@link retrieveCartStep} to retrieve a cart's details.
 *
 * :::
 *
 * @example
 * const data = validateExistingPaymentCollectionStep({
 *   cart: {
 *     // other cart details...
 *     payment_collection: {
 *       id: "paycol_123",
 *       // other payment collection details.
 *     }
 *   }
 * })
 */
export declare const validateExistingPaymentCollectionStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateExistingPaymentCollectionStepInput, unknown>;
export declare const createPaymentCollectionForCartWorkflowId = "create-payment-collection-for-cart";
/**
 * This workflow creates a payment collection for a cart. It's executed by the
 * [Create Payment Collection Store API Route](https://docs.medusajs.com/api/store#payment-collections_postpaymentcollections).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to wrap custom logic around adding creating a payment collection for a cart.
 *
 * @example
 * const { result } = await createPaymentCollectionForCartWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     metadata: {
 *       sandbox: true
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create payment collection for cart.
 */
export declare const createPaymentCollectionForCartWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreatePaymentCollectionForCartWorkflowInputDTO, unknown, any[]>;
//# sourceMappingURL=create-payment-collection-for-cart.d.ts.map