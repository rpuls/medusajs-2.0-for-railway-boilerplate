import { CustomerDTO } from "@medusajs/framework/types";
/**
 * The details of the customer to find or create.
 */
export interface FindOrCreateCustomerStepInput {
    /**
     * The ID of the customer to find.
     */
    customerId?: string | null;
    /**
     * If the `customerId` isn't specified,
     * find a customer with this email or create a new customer having this email.
     */
    email?: string | null;
}
/**
 * The details of the customer found or created.
 */
export interface FindOrCreateCustomerOutputStepOutput {
    /**
     * The customer found or created, if any.
     */
    customer?: CustomerDTO | null;
    /**
     * The email of the customer found or created, if any.
     */
    email?: string | null;
}
export declare const findOrCreateCustomerStepId = "find-or-create-customer";
/**
 * This step either finds a customer matching the specified ID, or finds / create a customer
 * matching the specified email. If both ID and email are provided, ID takes precedence.
 * If the customer is a guest, the email is updated to the provided email.
 */
export declare const findOrCreateCustomerStep: import("@medusajs/framework/workflows-sdk").StepFunction<FindOrCreateCustomerStepInput, FindOrCreateCustomerOutputStepOutput>;
//# sourceMappingURL=find-or-create-customer.d.ts.map