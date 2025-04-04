import { FilterableCustomerAddressProps, UpdateCustomerAddressDTO } from "@medusajs/framework/types";
/**
 * The data to update one or more customer addresses.
 */
export type UpdateCustomerAddresseStepInput = {
    /**
     * The filters to select the customer addresses to update.
     */
    selector: FilterableCustomerAddressProps;
    /**
     * The data to update the customer addresses with.
     */
    update: UpdateCustomerAddressDTO;
};
export declare const updateCustomerAddresseStepId = "update-customer-addresses";
/**
 * This step updates one or more customer addresses.
 *
 * @example
 * const data = updateCustomerAddressesStep({
 *   selector: {
 *     customer_id: "cus_123"
 *   },
 *   update: {
 *     country_code: "us"
 *   }
 * })
 */
export declare const updateCustomerAddressesStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateCustomerAddresseStepInput, import("@medusajs/framework/types").CustomerAddressDTO[]>;
//# sourceMappingURL=update-addresses.d.ts.map