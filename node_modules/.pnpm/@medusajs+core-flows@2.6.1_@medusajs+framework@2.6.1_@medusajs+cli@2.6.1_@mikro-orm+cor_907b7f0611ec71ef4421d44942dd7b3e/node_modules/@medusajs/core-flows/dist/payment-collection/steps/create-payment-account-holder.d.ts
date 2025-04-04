import { CreateAccountHolderDTO } from "@medusajs/framework/types";
export declare const createPaymentAccountHolderStepId = "create-payment-account-holder";
/**
 * This step creates the account holder in the payment provider.
 *
 * @example
 * const accountHolder = createPaymentAccountHolderStep({
 *   provider_id: "pp_stripe_stripe",
 *   context: {
 *     customer: {
 *       id: "cus_123",
 *       email: "example@gmail.com"
 *     }
 *   }
 * })
 */
export declare const createPaymentAccountHolderStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateAccountHolderDTO, import("@medusajs/framework/types").AccountHolderDTO>;
//# sourceMappingURL=create-payment-account-holder.d.ts.map