import { CreateCustomerAddressDTO, FilterableCustomerAddressProps, UpdateCustomerAddressDTO } from "@medusajs/framework/types";
/**
 * The addresses being created or updated.
 */
export type MaybeUnsetDefaultBillingAddressStepInput = {
    /**
     * The addresses being created. If the address has
     * the `is_default_billing` property set to `true`,
     * the existing default billing address of the customer will be unset.
     */
    create?: CreateCustomerAddressDTO[];
    /**
     * The addresses being updated.
     */
    update?: {
        /**
         * The selector to identify the customers to unset their default billing address.
         */
        selector: FilterableCustomerAddressProps;
        /**
         * The address details to update. The `is_default_billing` property
         * of existing customer addresses are only unset if
         * the `is_default_billing` property in this object is set to `true`.
         */
        update: UpdateCustomerAddressDTO;
    };
};
export declare const maybeUnsetDefaultBillingAddressesStepId = "maybe-unset-default-billing-customer-addresses";
/**
 * This step unsets the `is_default_billing` property of existing customer addresses
 * if the `is_default_billing` property in the addresses in the input is set to `true`.
 *
 * @example
 * const data = maybeUnsetDefaultBillingAddressesStep({
 *   create: [{
 *     customer_id: "cus_123",
 *     first_name: "John",
 *     last_name: "Doe",
 *     address_1: "123 Main St",
 *     city: "Anytown",
 *     country_code: "US",
 *     postal_code: "12345",
 *     phone: "555-555-5555"
 *     is_default_billing: true
 *   }],
 *   update: {
 *     selector: {
 *       customer_id: "cus_123"
 *     },
 *     update: {
 *       is_default_billing: true
 *     }
 *   }
 * })
 */
export declare const maybeUnsetDefaultBillingAddressesStep: import("@medusajs/framework/workflows-sdk").StepFunction<MaybeUnsetDefaultBillingAddressStepInput, undefined>;
//# sourceMappingURL=maybe-unset-default-billing-addresses.d.ts.map