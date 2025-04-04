import { CreateCustomerDTO, CustomerDTO } from "@medusajs/framework/types";
/**
 * The details of the customer account to create.
 */
export type CreateCustomerAccountWorkflowInput = {
    /**
     * The ID of the auth identity to attach the customer to.
     */
    authIdentityId: string;
    /**
     * The details of the customer to create.
     */
    customerData: CreateCustomerDTO;
};
export declare const createCustomerAccountWorkflowId = "create-customer-account";
/**
 * This workflow creates a customer and attaches it to an auth identity. It's used by the
 * [Register Customer Store API Route](https://docs.medusajs.com/api/store#customers_postcustomers).
 *
 * You can create an auth identity first using the [Retrieve Registration JWT Token API Route](https://docs.medusajs.com/api/store#auth_postactor_typeauth_provider_register).
 * Learn more about basic authentication flows in [this documentation](https://docs.medusajs.com/resources/commerce-modules/auth/authentication-route).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * register or create customer accounts within your custom flows.
 *
 * @example
 * const { result } = await createCustomerAccountWorkflow(container)
 * .run({
 *   input: {
 *     authIdentityId: "au_1234",
 *     customerData: {
 *       first_name: "John",
 *       last_name: "Doe",
 *       email: "john.doe@example.com",
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create or register a customer account.
 */
export declare const createCustomerAccountWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateCustomerAccountWorkflowInput, CustomerDTO, []>;
//# sourceMappingURL=create-customer-account.d.ts.map