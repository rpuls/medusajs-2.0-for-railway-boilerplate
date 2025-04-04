import { CreateCustomerAddressDTO } from "@medusajs/framework/types";
/**
 * The data to create one or more customer addresses.
 */
export type CreateCustomerAddressesStepInput = CreateCustomerAddressDTO[];
export declare const createCustomerAddressesStepId = "create-customer-addresses";
/**
 * This step creates one or more customer addresses.
 *
 * @example
 * const data = createCustomerAddressesStep([
 *   {
 *     customer_id: "cus_123",
 *     first_name: "John",
 *     last_name: "Doe",
 *     address_1: "123 Main St",
 *     city: "Anytown",
 *     province: "NY",
 *     postal_code: "12345",
 *     country_code: "us",
 *   }
 * ])
 */
export declare const createCustomerAddressesStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateCustomerAddressesStepInput, import("@medusajs/framework/types").CustomerAddressDTO[]>;
//# sourceMappingURL=create-addresses.d.ts.map