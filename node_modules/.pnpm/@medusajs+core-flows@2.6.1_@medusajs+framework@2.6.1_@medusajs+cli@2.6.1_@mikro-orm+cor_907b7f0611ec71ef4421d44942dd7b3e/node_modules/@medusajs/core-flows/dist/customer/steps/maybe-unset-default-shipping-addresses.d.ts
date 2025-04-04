import { CreateCustomerAddressDTO, FilterableCustomerAddressProps, UpdateCustomerAddressDTO } from "@medusajs/framework/types";
/**
 * The addresses being created or updated.
 */
export type MaybeUnsetDefaultShippingAddressesStepInput = {
    /**
     * The addresses being created. If the address has
     * the `is_default_shipping` property set to `true`,
     * the existing default shipping address of the customer will be unset.
     */
    create?: CreateCustomerAddressDTO[];
    /**
     * The addresses being updated.
     */
    update?: {
        /**
         * The selector to identify the customers to unset their default shipping address.
         */
        selector: FilterableCustomerAddressProps;
        /**
         * The address details to update. The `is_default_shipping` property
         * of existing customer addresses are only unset if
         * the `is_default_shipping` property in this object is set to `true`.
         */
        update: UpdateCustomerAddressDTO;
    };
};
export declare const maybeUnsetDefaultShippingAddressesStepId = "maybe-unset-default-shipping-customer-addresses";
/**
 * This step unsets the `is_default_billing` property of existing customer addresses
 * if the `is_default_billing` property in the addresses in the input is set to `true`.
 *
 * @example
 * const data = maybeUnsetDefaultShippingAddressesStep({
 *   create: [{
 *     customer_id: "cus_123",
 *     first_name: "John",
 *     last_name: "Doe",
 *     address_1: "123 Main St",
 *     city: "Anytown",
 *     country_code: "US",
 *     postal_code: "12345",
 *     phone: "555-555-5555",
 *     is_default_shipping: true
 *   }],
 *   update: {
 *     selector: {
 *       customer_id: "cus_123"
 *     },
 *     update: {
 *       is_default_shipping: true
 *     }
 *   }
 * })
 */
export declare const maybeUnsetDefaultShippingAddressesStep: import("@medusajs/framework/workflows-sdk").StepFunction<MaybeUnsetDefaultShippingAddressesStepInput, undefined>;
//# sourceMappingURL=maybe-unset-default-shipping-addresses.d.ts.map