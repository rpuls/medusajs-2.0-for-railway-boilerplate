import { PaymentSessionDTO } from "@medusajs/framework/types";
/**
 * The data to create payment sessions.
 */
export interface CreatePaymentSessionsWorkflowInput {
    /**
     * The ID of the payment collection to create payment sessions for.
     */
    payment_collection_id: string;
    /**
     * The ID of the payment provider that the payment sessions are associated with.
     * This provider is used to later process the payment sessions and their payments.
     */
    provider_id: string;
    /**
     * The ID of the customer that the payment session should be associated with.
     */
    customer_id?: string;
    /**
     * Custom data relevant for the payment provider to process the payment session.
     * Learn more in [this documentation](https://docs.medusajs.com/resources/commerce-modules/payment/payment-session#data-property).
     */
    data?: Record<string, unknown>;
    /**
     * Additional context that's useful for the payment provider to process the payment session.
     * Currently all of the context is calculated within the workflow.
     */
    context?: Record<string, unknown>;
}
export declare const createPaymentSessionsWorkflowId = "create-payment-sessions";
/**
 * This workflow creates payment sessions. It's used by the
 * [Initialize Payment Session Store API Route](https://docs.medusajs.com/api/store#payment-collections_postpaymentcollectionsidpaymentsessions).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create payment sessions in your custom flows.
 *
 * @example
 * const { result } = await createPaymentSessionsWorkflow(container)
 * .run({
 *   input: {
 *     payment_collection_id: "paycol_123",
 *     provider_id: "pp_system"
 *   }
 * })
 *
 * @summary
 *
 * Create payment sessions.
 */
export declare const createPaymentSessionsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreatePaymentSessionsWorkflowInput, PaymentSessionDTO, []>;
//# sourceMappingURL=create-payment-session.d.ts.map