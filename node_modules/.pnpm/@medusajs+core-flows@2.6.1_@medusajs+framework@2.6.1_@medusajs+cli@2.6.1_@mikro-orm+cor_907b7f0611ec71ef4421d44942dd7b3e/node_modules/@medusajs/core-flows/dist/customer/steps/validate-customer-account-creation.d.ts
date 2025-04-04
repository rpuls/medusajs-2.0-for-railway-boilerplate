import { CreateCustomerAccountWorkflowInput } from "../workflows";
export declare const validateCustomerAccountCreationStepId = "validate-customer-account-creation";
/**
 * This step validates the input data for creating a customer account.
 * The step throws an error if:
 *
 * - The email is missing
 * - A customer with the email already exists and has an account
 * - A guest customer with the email already exists
 *
 * @example
 * const data = validateCustomerAccountCreation({
 *   authIdentityId: "au_1234",
 *   customerData: {
 *     first_name: "John",
 *     last_name: "Doe",
 *     email: "john.doe@example.com",
 *   }
 * })
 */
export declare const validateCustomerAccountCreation: import("@medusajs/framework/workflows-sdk").StepFunction<CreateCustomerAccountWorkflowInput, unknown>;
//# sourceMappingURL=validate-customer-account-creation.d.ts.map