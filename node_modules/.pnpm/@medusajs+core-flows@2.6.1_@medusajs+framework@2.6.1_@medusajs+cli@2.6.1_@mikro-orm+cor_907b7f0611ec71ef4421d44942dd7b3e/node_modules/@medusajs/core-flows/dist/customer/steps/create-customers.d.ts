import { CreateCustomerDTO } from "@medusajs/framework/types";
/**
 * The data to create one or more customers.
 */
export type CreateCustomersStepInput = CreateCustomerDTO[];
export declare const createCustomersStepId = "create-customers";
/**
 * This step creates one or more customers.
 *
 * @example
 * const data = createCustomersStep([
 *   {
 *     first_name: "John",
 *     last_name: "Doe",
 *     email: "customer@example.com",
 *   }
 * ])
 */
export declare const createCustomersStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateCustomersStepInput, import("@medusajs/framework/types").CustomerDTO[]>;
//# sourceMappingURL=create-customers.d.ts.map